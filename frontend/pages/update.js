
import UpdateItem from '../components/UpdateItem'

const Sell = ({ query }) => (
  <div>
    <h1>Edit Item</h1>
    <UpdateItem id={query.id} />
  </div>
)

export default Sell