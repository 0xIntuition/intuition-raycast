import { ActionPanel, Action, List, Image, Icon } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState } from "react";
import { API_URL, getAtomUrl } from "./lib/consts/general";
import { GET_ATOMS_QUERY } from "./lib/queries/atoms";
import { truncateNumber, getShareValue, formatEthValue } from "./lib/utils/format";

interface SearchResult {
  id: string;
  label?: string;
  image?: string;
  emoji?: string;
  creator?: {
    id: string;
    label?: string;
    image?: string;
  };
  block_timestamp?: string;
  vault?: {
    position_count: string;
    total_shares: string;
    current_share_price: string;
  };
  vault_id?: string;
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
      query: GET_ATOMS_QUERY,
      variables: {
        searchTerm: `%${searchText}%`,
        offset: offset,
      },
    }),
    parseResponse: parseFetchResponse,
  });

  return (
    <List isLoading={isLoading} onSearchTextChange={setSearchText} searchBarPlaceholder="Search atoms..." throttle>
      <List.Section title="Results" subtitle={data?.totalCount ? `${truncateNumber(data.totalCount)}` : "0"}>
        {data?.atoms?.map((searchResult) => <SearchListItem key={searchResult.id} searchResult={searchResult} />)}
      </List.Section>
    </List>
  );
}

function SearchListItem({ searchResult }: { searchResult: SearchResult }) {
  // Calculate ETH value using the getShareValue utility
  const totalShares = BigInt(searchResult.vault?.total_shares || 0);
  const sharePrice = BigInt(searchResult.vault?.current_share_price || 0);
  const ethValue = getShareValue(totalShares, sharePrice);
  const atomUrl = getAtomUrl(searchResult.vault_id || searchResult.id);

  return (
    <List.Item
      title={searchResult.label ?? searchResult.id}
      subtitle={`${searchResult.vault_id || "N/A"}`}
      icon={{
        source: searchResult.image ?? "",
        mask: Image.Mask.Circle,
      }}
      accessories={[
        { icon: Icon.ArrowUp, text: formatEthValue(ethValue) },
        { icon: Icon.Person, text: truncateNumber(searchResult.vault?.position_count || "0") },
      ]}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser title="Open in Browser" url={atomUrl} />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.CopyToClipboard title="Copy URL" content={atomUrl} shortcut={{ modifiers: ["cmd"], key: "." }} />
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
    return { atoms: [], totalCount: 0 };
  }

  // Check if atoms exists in data
  if (!json.data.atoms) {
    console.error("No atoms found in response:", json.data);
    return { atoms: [], totalCount: 0 };
  }

  return {
    atoms: json.data.atoms as SearchResult[],
    totalCount: json.data.atoms_aggregate?.aggregate?.count || 0,
  };
}
