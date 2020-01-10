import CreateItem from '../components/CreateItem'
import PleaseSignIn from '../components/PleaseSignIn'

const Sell = props => (
  <div>
    <h1>Sell</h1>
    <PleaseSignIn>
      <CreateItem />
    </PleaseSignIn>
  </div>
)

export default Sell