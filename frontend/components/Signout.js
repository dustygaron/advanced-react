import React from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import { CURRENT_USER_QUERY } from './User'

const SIGN_OUT_MUTATON = gql`
  mutation SIGN_OUT_MUTATON {
    signout {
      message
    }
  }
`

const Signout = props => (
  <Mutation
    mutation={SIGN_OUT_MUTATON}
    refetchQueries={[{ query: CURRENT_USER_QUERY }]}
  >
    {signout => <button onClick={signout}>Sign Out</button>}
  </Mutation>
)

export default Signout