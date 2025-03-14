import { gql } from "graphql-request";

export const GET_TRIPLES_QUERY = gql`
  query GetTriples($searchTerm: String!, $offset: Int) {
    triples_aggregate {
      aggregate {
        count
      }
    }
    triples(
      where: {
        _or: [
          { subject: { label: { _ilike: $searchTerm } } },
          { predicate: { label: { _ilike: $searchTerm } } },
          { object: { label: { _ilike: $searchTerm } } }
        ]
      }
      order_by: { vault: { total_shares: desc } }
      limit: 10
      offset: $offset
    ) {
      id
      vault_id
      counter_vault_id
      subject {
        id
        image
        label
      }
      predicate {
        id
        label
      }
      object {
        id
        label
      }
      creator {
        id
        label
        image
      }
      block_timestamp
      counter_vault {
        current_share_price
        position_count
        total_shares
      }
      vault {
        current_share_price
        position_count
        total_shares
      }
    }
  }
`;