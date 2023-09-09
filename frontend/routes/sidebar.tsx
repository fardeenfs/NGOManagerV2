/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
 *
 */

interface IRoute{
  path?: string
  icon?: string
  name: string
  routes?: IRoute[]
  checkActive?(pathname: String, route: IRoute): boolean
  exact?: boolean
}

export function routeIsActive (pathname: String, route: IRoute): boolean {
  if (route.checkActive) {
    return route.checkActive(pathname, route)
  }

  return route?.exact
    ? pathname == route?.path
    : (route?.path ? pathname.indexOf(route.path) === 0 : false)
}

const routes: IRoute[] = [
  {
    path: '/service', // the url
    icon: 'HomeIcon', // the component being exported from icons/index.js
    name: 'Dashboard', // name that appear in Sidebar
    exact: true,
  },
  {
    path: '/service/income-expense',
    icon: 'PagesIcon',
    name: 'Income Expense',
  },
  {
    icon: 'MoneyIcon',
    name: 'Financial',
    routes: [
      {path: '/service/financial/accounts',
      name: 'Accounts'},
      {path: '/service/financial/manual-transactions',
      name: 'Manual Transactions'},
    
    ]
  },
  {
    icon: 'PeopleIcon',
    name: 'Membership',
    routes: [
      {path: '/service/membership/new/member',
      name: 'New Member'},
      {path: '/service/membership/new/family',
      name: 'New Family'},
    
    ]
  },
  {
    path: '/service/dues/config',
    icon: 'TablesIcon',
    name: 'Dues Configuration',
  },
  {
    path: '/service/reports',
    icon: 'FormsIcon',
    name: 'Reports',
  },
  {
    path: '/service/settings',
    icon: 'OutlineCogIcon',
    name: 'Settings',
  },
]

export type {IRoute}
export default routes
