import { gql } from "graphql-request";

export const GET_TRIPLES_QUERY = gql`
  query GetTriples($searchTerm: String!) {
    triples_aggregate(where: { label: { _ilike: $searchTerm } }) {
      nodes {
        label
        id
        subject {
          image
          vaultId
          label
        }
        predicate {
          vaultId
          label
        }
        object {
          vaultId
          label
        }
        counterVault {
          currentSharePrice
          positionCount
          totalShares
        }
        vault {
          currentSharePrice
          positionCount
          totalShares
        }
      }
    }
  }
`;