import PleaseSignIn from '../components/PleaseSignIn'
import Permissions from '../components/Permissions'

const PermissionsPage = props => (
  <div>
    <PleaseSignIn>
      <h1>Permissions</h1>
      <Permissions />
    </PleaseSignIn>
  </div>
)

export default PermissionsPage