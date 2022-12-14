import { matchRoutes, useLocation } from "react-router-dom"

const routes = [
  { path: "/" },
  { path: "/silo/:tokenSymbol/rates" },
  { path: "/silo/:tokenSymbol/tvl" },
]

const useCurrentPath = () => {
  const location = useLocation()
  const match = matchRoutes(routes, location)

  if(match?.[0]?.route?.path) {
    return match?.[0]?.route?.path;
  } else {
    return ''
  }
}

export default useCurrentPath;