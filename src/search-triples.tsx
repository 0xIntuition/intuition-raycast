import { ActionPanel, Action, List, Image, Icon, Color } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState } from "react";
import { GET_TRIPLES_QUERY } from "./lib/queries/triples";
import { API_URL, getTripleUrl } from "./lib/consts/general";
import { truncateNumber, getShareValue, formatEthValue } from "./lib/utils/format";

interface SearchResult {
  id: string;
  subject: {
    id: string;
    image: string;
    label: string;
  };
  predicate: {
    id: string;
    label: string;
  };
  object: {
    id: string;
    label: string;
  };
  creator?: {
    id: string;
    label?: string;
    image?: string;
  };
  block_timestamp?: string;
  counter_vault: {
    current_share_price: string;
    position_count: string;
    total_shares: string;
  };
  vault: {
    current_share_price: string;
    position_count: string;
    total_shares: string;
  };
  vault_id?: string;
  counter_vault_id?: string;
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
      query: GET_TRIPLES_QUERY,
      variables: {
        searchTerm: `%${searchText}%`,
        offset: offset,
      },
    }),
    parseResponse: parseFetchResponse,
  });

  return (
    <List isLoading={isLoading} onSearchTextChange={setSearchText} searchBarPlaceholder="Search triples..." throttle>
      <List.Section title="Results" subtitle={data?.totalCount ? `${truncateNumber(data.totalCount)}` : "0"}>
        {data?.triples?.map((searchResult) => <SearchListItem key={searchResult.id} searchResult={searchResult} />)}
      </List.Section>
    </List>
  );
}

function SearchListItem({ searchResult }: { searchResult: SearchResult }) {
  // Calculate ETH value using the getShareValue utility
  const totalShares = BigInt(searchResult.vault?.total_shares || 0);
  const sharePrice = BigInt(searchResult.vault?.current_share_price || 0);
  const ethValue = getShareValue(totalShares, sharePrice);
  const tripleUrl = getTripleUrl(searchResult.vault_id || searchResult.id);

  // Format date if available
  const createdDate = searchResult.block_timestamp
    ? new Date(parseInt(searchResult.block_timestamp) * 1000).toLocaleDateString()
    : "";

  return (
    <List.Item
      title={`${searchResult.subject.label} ${searchResult.predicate.label} ${searchResult.object.label}`}
      subtitle={`${searchResult.vault_id || "N/A"}`}
      icon={{
        source: searchResult.subject.image ?? "",
        mask: Image.Mask.Circle,
      }}
      accessories={[
        { icon: Icon.ArrowUp, text: formatEthValue(ethValue) },
        { icon: Icon.Person, text: truncateNumber(searchResult.vault?.position_count || "0") },
      ]}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser title="Open in Browser" url={tripleUrl} />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.CopyToClipboard title="Copy URL" content={tripleUrl} shortcut={{ modifiers: ["cmd"], key: "." }} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

async function parseFetchResponse(response: Response) {
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
    return { triples: [], totalCount: 0 };
  }

  // Check if triples exists in data
  if (!json.data.triples) {
    console.error("No triples found in response:", json.data);
    return { triples: [], totalCount: 0 };
  }

  return {
    triples: json.data.triples as SearchResult[],
    totalCount: json.data.triples_aggregate?.aggregate?.count || 0,
  };
}
