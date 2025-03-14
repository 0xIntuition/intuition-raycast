import { ActionPanel, Action, List, Image, Icon } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState } from "react";
import { API_URL, getListUrl } from "./lib/consts/general";
import { GET_LISTS_QUERY } from "./lib/queries/lists";
import { truncateNumber } from "./lib/utils/format";

// Interface for list search results
interface ListSearchResult {
  claim_count: string;
  triple_count: string;
  object: {
    image: string;
    label: string;
    id: string;
  };
}

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useFetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GET_LISTS_QUERY,
      variables: {
        searchTerm: `%${searchText}%`,
        offset: offset,
      },
    }),
    parseResponse: parseListsResponse,
  });

  return (
    <List isLoading={isLoading} onSearchTextChange={setSearchText} searchBarPlaceholder="Search lists..." throttle>
      <List.Section title="Lists" subtitle={data?.totalCount ? `${truncateNumber(data.totalCount)}` : "0"}>
        {data?.lists?.map((list) => <ListItem key={list.object.id} list={list} />)}
      </List.Section>
    </List>
  );
}

// List item component
function ListItem({ list }: { list: ListSearchResult }) {
  const listUrl = getListUrl(list.object.id);

  return (
    <List.Item
      title={list.object.label}
      subtitle={`${truncateNumber(list.triple_count)} items`}
      icon={{
        source: list.object.image ?? Icon.List,
        mask: Image.Mask.Circle,
      }}
      accessories={[{ icon: Icon.Document, text: truncateNumber(list.triple_count) }]}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser title="Open in Browser" url={listUrl} />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.CopyToClipboard title="Copy URL" content={listUrl} shortcut={{ modifiers: ["cmd"], key: "." }} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

// Parse the lists search response
async function parseListsResponse(response: Response) {
  const json = await response.json();

  if (!response.ok || "message" in json) {
    throw new Error("message" in json ? json.message : response.statusText);
  }

  // Check for errors in the response
  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    throw new Error(json.errors[0]?.message || "GraphQL error occurred");
  }

  // Check if data exists
  if (!json.data) {
    console.error("No data returned from API:", json);
    return { lists: [], totalCount: 0 };
  }

  // Check if predicate_objects exists in data
  if (!json.data.predicate_objects) {
    console.error("No lists found in response:", json.data);
    return { lists: [], totalCount: 0 };
  }

  return {
    lists: json.data.predicate_objects as ListSearchResult[],
    totalCount: json.data.predicate_objects_aggregate?.aggregate?.count || 0,
  };
}
