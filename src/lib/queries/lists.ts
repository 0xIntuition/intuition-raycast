import { gql } from "graphql-request";

export const GET_LISTS_QUERY = gql`
  query GetLists($searchTerm: String!, $offset: Int) {
    predicate_objects_aggregate(
      where: { 
        predicate_id: { _eq: 4 },
        object: { label: { _ilike: $searchTerm } }
      }
    ) {
      aggregate {
        count
      }
    }
    predicate_objects(
      where: { 
        predicate_id: { _eq: 4 },
        object: { label: { _ilike: $searchTerm } }
      }
      order_by: [{ triple_count: desc }, { claim_count: desc }]
      limit: 100
      offset: $offset
    ) {
      claim_count
      triple_count
      object {
        image
        label
        id
      }
    }
  }
`;

export const GET_LIST_ITEMS_QUERY = gql`
  query GetListItems($listId: numeric!, $searchTerm: String!, $offset: Int) {
    triples_aggregate(
      where: { 
        predicate_id: { _eq: 4 }, 
        object_id: { _eq: $listId },
        subject: { label: { _ilike: $searchTerm } }
      }
    ) {
      aggregate {
        count
      }
    }
    atom(
      id: $listId  
    ) {
      id
      label
      image
    }
    triples(
      limit: 10, offset: $offset
      order_by: [{ vault: { position_count: desc } }]
      where: { 
        predicate_id: { _eq: 4 }, 
        object_id: { _eq: $listId },
        subject: { label: { _ilike: $searchTerm } }
      }
    ) {
      id
      subject {
        id
        label
        image
        vault_id
      }
      creator {
        id
        label
        image
      }
      block_timestamp
      vault {
        total_shares
        position_count
        current_share_price
      }
      counter_vault {
        total_shares
        position_count
        current_share_price
      }
      vault_id
    }
  }
`; 