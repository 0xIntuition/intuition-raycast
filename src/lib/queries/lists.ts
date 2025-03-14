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