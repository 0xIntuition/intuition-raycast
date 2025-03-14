import { ActionPanel, Action, List, Image, Icon, launchCommand, LaunchType } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState, useEffect } from "react";
import { getApiUrl, getListUrl } from "./lib/consts/general";
import { GET_LISTS_QUERY } from "./lib/queries/lists";
import { truncateNumber } from "./lib/utils/format";
import AtomDetail from "./atom-detail";

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
  const [lists, setLists] = useState<ListSearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const apiUrl = getApiUrl();

  const { data, isLoading, revalidate } = useFetch(apiUrl, {
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
    onData: (data) => {
      if (offset === 0) {
        // Initial load or search change
        setLists(data.lists);
      } else {
        // Loading more data
        setLists((prevLists) => [...prevLists, ...data.lists]);
      }
      setTotalCount(data.totalCount);
      setIsLoadingMore(false);
    },
  });

  // Reset offset when search text changes
  useEffect(() => {
    setOffset(0);
  }, [searchText]);

  // Handle loading more lists
  const handleLoadMore = () => {
    if (lists.length < totalCount) {
      setIsLoadingMore(true);
      setOffset(lists.length);
    }
  };

  return (
    <List
      isLoading={isLoading && offset === 0}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search lists..."
      throttle
      pagination={{
        onLoadMore: handleLoadMore,
        hasMore: lists.length < totalCount,
        pageSize: 10,
      }}
    >
      <List.Section title="Lists" subtitle={totalCount ? `${truncateNumber(totalCount)}` : "0"}>
        {lists.map((list) => (
          <ListItem key={list.object.id} list={list} />
        ))}
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
            <Action.Push
              title="Search Within List"
              icon={Icon.MagnifyingGlass}
              target={<SearchWithinListWrapper listId={list.object.id} listName={list.object.label} />}
            />
            <Action.Push
              title="View List Details"
              icon={Icon.Sidebar}
              target={<AtomDetail atomId={list.object.id} address="" />}
            />
            <Action.OpenInBrowser title="Open in Browser" url={listUrl} shortcut={{ modifiers: ["cmd"], key: "o" }} />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.CopyToClipboard title="Copy URL" content={listUrl} shortcut={{ modifiers: ["cmd"], key: "." }} />
            <Action.CopyToClipboard
              title="Copy ID"
              content={list.object.id}
              shortcut={{ modifiers: ["cmd", "shift"], key: "." }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

// Wrapper component to launch the search-within-list command
function SearchWithinListWrapper({ listId, listName }: { listId: string; listName: string }) {
  // Use useEffect to launch the command when the component mounts
  useEffect(() => {
    launchCommand({
      name: "search-within-list",
      type: LaunchType.UserInitiated,
      arguments: {
        listId,
        listName,
      },
    });
  }, [listId, listName]);

  // Return a loading list as a placeholder
  return (
    <List isLoading={true}>
      <List.EmptyView title={`Loading items in "${listName}"...`} />
    </List>
  );
}

// Parse the lists response
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
