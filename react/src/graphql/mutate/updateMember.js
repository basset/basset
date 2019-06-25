import gql from 'graphql-tag';

export default gql`
  mutation updateMember($member: MemberInput!) {
    updateMember(member: $member) {
      id
      active
      admin
      createdAt
      user {
        id
        name
        email
        profileImage
      }
    }
  }
`;
