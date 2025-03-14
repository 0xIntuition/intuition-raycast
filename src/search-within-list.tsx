import { ActionPanel, Action, List, Image, Icon, LaunchProps } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState, useEffect } from "react";
import { getApiUrl, getTripleUrl, getAtomUrl } from "./lib/consts/general";
import { GET_LIST_ITEMS_QUERY } from "./lib/queries/lists";
import { truncateNumber, getShareValue, formatEthValue } from "./lib/utils/format";
import AtomDetail from "./atom-detail";

// Interface for list details
interface ListDetails {
  id: string;
  label: string;
  image: string;
}

// Interface for atoms in a list (subject of the triple)
interface ListAtom {
  id: string;
  subject: {
    id: string;
    label: string;
    image: string;
    vault_id?: string;
  };
  creator: {
    id: string;
    label: string;
    image: string;
  };
  block_timestamp: string;
  vault: {
    total_shares: string;
    position_count: string;
    current_share_price: string;
  };
  counter_vault: {
    total_shares: string;
    position_count: string;
    current_share_price: string;
  };
  vault_id: string;
}

// Arguments interface
interface CommandArguments {
  listId?: string;
  listName?: string;
}

export default function Command(props: LaunchProps<{ arguments: CommandArguments }>) {
  // Get arguments passed from the list search command
  const { listId, listName } = props.arguments || {};
  const displayName = listName || "List";

  const [searchText, setSearchText] = useState("");
  const [offset, setOffset] = useState(0);
  const [listItems, setListItems] = useState<ListAtom[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [listDetails, setListDetails] = useState<ListDetails | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const apiUrl = getApiUrl();

  // Return early if no list ID is provided
  if (!listId) {
    return (
      <List>
        <List.EmptyView
          title="No List Selected"
          description="Please select a list from the Search Lists command first."
          icon={Icon.ExclamationMark}
        />
      </List>
    );
  }

  const { data, isLoading, revalidate } = useFetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GET_LIST_ITEMS_QUERY,
      variables: {
        listId: listId,
        searchTerm: `%${searchText}%`,
        offset: offset,
      },
    }),
    parseResponse: parseListItemsResponse,
    onData: (data) => {
      if (offset === 0) {
        // Initial load or search change
        setListItems(data.triples);
      } else {
        // Loading more data
        setListItems((prevItems) => [...prevItems, ...data.triples]);
      }
      setTotalCount(data.totalCount);
      setListDetails(data.list);
      setIsLoadingMore(false);
    },
  });

  // Reset offset when search text changes
  useEffect(() => {
    setOffset(0);
  }, [searchText]);

  // Handle loading more items
  const handleLoadMore = () => {
    if (listItems.length < totalCount) {
      setIsLoadingMore(true);
      setOffset(listItems.length);
    }
  };

  return (
    <List
      isLoading={isLoading && offset === 0}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder={`Search in "${displayName}"...`}
      throttle
      navigationTitle={`Search in "${displayName}"`}
      pagination={{
        onLoadMore: handleLoadMore,
        hasMore: listItems.length < totalCount,
        pageSize: 10,
      }}
    >
      <List.Section title="Results" subtitle={totalCount ? `${truncateNumber(totalCount)}` : "0"}>
        {listItems.map((triple) => (
          <AtomListItem key={triple.id} triple={triple} />
        ))}
      </List.Section>
      {listItems.length === 0 && !isLoading && (
        <List.EmptyView
          title="No Items Found"
          description={searchText ? "Try a different search term" : "This list appears to be empty"}
          icon={Icon.MagnifyingGlass}
        />
      )}
    </List>
  );
}

// Atom item component (similar to SearchListItem in search-atoms.tsx)
function AtomListItem({ triple }: { triple: ListAtom }) {
  // Calculate ETH value using the getShareValue utility
  const totalShares = BigInt(triple.vault?.total_shares || 0);
  const sharePrice = BigInt(triple.vault?.current_share_price || 0);
  const ethValue = getShareValue(totalShares, sharePrice);

  // Get the atom URL for the subject (which is the atom)
  const atomId = triple.subject.vault_id || triple.subject.id;
  const atomUrl = getAtomUrl(atomId);

  return (
    <List.Item
      title={triple.subject.label}
      subtitle={`${atomId}`}
      icon={{
        source: triple.subject.image ?? "",
        mask: Image.Mask.Circle,
      }}
      accessories={[
        { icon: Icon.ArrowUp, text: formatEthValue(ethValue) },
        { icon: Icon.Person, text: truncateNumber(triple.vault?.position_count || "0") },
      ]}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.Push title="View Details" icon={Icon.Sidebar} target={<AtomDetail atomId={atomId} address="" />} />
            <Action.OpenInBrowser title="Open in Browser" url={atomUrl} shortcut={{ modifiers: ["cmd"], key: "o" }} />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.CopyToClipboard title="Copy URL" content={atomUrl} shortcut={{ modifiers: ["cmd"], key: "." }} />
            <Action.CopyToClipboard
              title="Copy ID"
              content={atomId}
              shortcut={{ modifiers: ["cmd", "shift"], key: "." }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

// Parse the list items response
async function parseListItemsResponse(response: Response) {
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
    return { triples: [], totalCount: 0, list: null };
  }

  return {
    list: json.data.atom as ListDetails,
    triples: json.data.triples as ListAtom[],
    totalCount: json.data.triples_aggregate?.aggregate?.count || 0,
  };
}
