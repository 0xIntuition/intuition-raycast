import { ActionPanel, Action, List, Image, Icon, Color } from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState } from "react";
import { formatEther } from "viem";
import { GET_TRIPLES_QUERY } from "./lib/queries/triples";
import { API_URL, PORTAL_URL } from "./lib/consts/general";

interface SearchResult {
  id: string;
  label?: string;
  subject: {
    image: string;
    vaultId: string;
    label: string;
  };
  predicate: {
    vaultId: string;
    label: string;
  };
  object: {
    vaultId: string;
    label: string;
  };
  counterVault: {
    currentSharePrice: string;
    positionCount: string;
    totalShares: string;
  };
  vault: {
    currentSharePrice: string;
    positionCount: string;
    totalShares: string;
  };
}

export default function Command() {
  const [searchText, setSearchText] = useState("");
  const { data, isLoading } = useFetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GET_TRIPLES_QUERY,
      variables: {
        searchTerm: `%${searchText}%`,
      },
    }),
    parseResponse: parseFetchResponse,
  });

  return (
    <List isLoading={isLoading} onSearchTextChange={setSearchText} searchBarPlaceholder="Search triples..." throttle>
      <List.Section title="Results" subtitle={data?.length + ""}>
        {data?.map((searchResult) => <SearchListItem key={searchResult.id} searchResult={searchResult} />)}
      </List.Section>
    </List>
  );
}

function SearchListItem({ searchResult }: { searchResult: SearchResult }) {
  const totalPositiveStaked =
    parseFloat(formatEther(BigInt(searchResult.vault?.totalShares || 0))) *
    parseFloat(formatEther(BigInt(searchResult.vault?.currentSharePrice || 0)));
  const totalNegativeStaked =
    parseFloat(formatEther(BigInt(searchResult.counterVault?.totalShares || 0))) *
    parseFloat(formatEther(BigInt(searchResult.counterVault?.currentSharePrice || 0)));

  return (
    <List.Item
      title={searchResult.label ?? searchResult.id}
      subtitle={searchResult.id}
      icon={{
        source: searchResult.subject.image ?? "",
        mask: Image.Mask.Circle,
      }}
      accessories={[
        {
          icon: {
            source: Icon.ArrowDown,
            tintColor: totalNegativeStaked === 0 ? Color.SecondaryText : Color.Red,
          },
          text: {
            value: `${totalNegativeStaked.toFixed(4)} ETH`,
            color: totalNegativeStaked === 0 ? Color.SecondaryText : Color.Red,
          },
        },
        {
          icon: {
            source: Icon.ArrowUp,
            tintColor: totalPositiveStaked === 0 ? Color.SecondaryText : Color.Green,
          },
          text: {
            value: `${totalPositiveStaked.toFixed(4)} ETH`,
            color: totalPositiveStaked === 0 ? Color.SecondaryText : Color.Green,
          },
        },
      ]}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.OpenInBrowser title="Open in Browser" url={`${PORTAL_URL}/app/claim/${searchResult.id}`} />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <Action.CopyToClipboard
              title="Copy URL"
              content={`${PORTAL_URL}/app/claim/${searchResult.id}`}
              shortcut={{ modifiers: ["cmd"], key: "." }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

/** Parse the response from the fetch query into something we can display */
async function parseFetchResponse(response: Response) {
  const json = await response.json();

  if (!response.ok || "message" in json) {
    throw new Error("message" in json ? json.message : response.statusText);
  }

  return json.data.triples_aggregate.nodes as SearchResult[];
}
