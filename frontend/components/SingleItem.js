import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Error from './ErrorMessage'
import styled from 'styled-components'
import Head from 'next/head'
import AddToCart from '../components/AddToCart'
import formatMoney from '../lib/formatMoney'

const SingleItemStyles = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  box-shadow: ${props => props.theme.bs};
  display: grid;
  grid-auto-columns: 2fr;
  grid-auto-flow: column;
  min-height: 800px;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .details {
    margin: 3rem;
    padding: 2rem;
    font-size: 2rem;
    background-color: #eee;
    text-align: left;
  }
   button {
    padding: 20px;
    background-color: #00B8D4;
    font-size: 12px;
    text-transform: uppercase;
    color: white;
    float: right;
  }
  h2 {
    text-align: left;
  }
  p {
    font-family: 'system-ui';
  }
  span {
    font-weight: bold;
  }
`



const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!){
    item(where: {id: $id}) {
      id
      title
      description
      largeImage
      price
    }
  }
`

export default class SingleItem extends React.Component {
  render() {
    return (
      <div>
        <Query
          query={SINGLE_ITEM_QUERY}
          variables={{
            id: this.props.id
          }}
        >
          {({ error, loading, data }) => {
            if (error) return <Error error={error} />
            if (loading) return <p>Loading...</p>
            if (!data.item) return <p>No item found for {this.props.id}</p>
            console.log(data)

            const item = data.item
            return (
              <>
                <SingleItemStyles>
                  <Head>
                    <title>Dev Life | {item.title}</title>
                  </Head>
                  <img src={item.largeImage} alt={item.title} />
                  <div className='details'>
                    <h2>{item.title}</h2>
                    <p>{item.description}</p>
                    <p>{formatMoney(item.price)} </p>
                    <AddToCart id={item.id} style={{ height: '33px' }} />
                  </div>
                </SingleItemStyles>
              </>
            )
          }}
        </Query>


      </div>
    )
  }
}
