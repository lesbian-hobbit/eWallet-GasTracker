import { parse } from "react-native-redash"

export const getPathXCenter = currentPath => {
  const parsedPath = parse(currentPath)
  if (!parsedPath || !parsedPath.curves) {
    // Handle the case when 'currentPath' is undefined or doesn't have 'curves'
    return null
  }
  const curves = parsedPath.curves
  const startPoint = curves[0].to
  const endPoint = curves[curves.length - 1].to
  const centerX = (startPoint.x + endPoint.x) / 2
  return centerX
}

export const getPathXCenterByIndex = (tabPaths, index) => {
  const pathAtIndex = tabPaths[index]
  if (!pathAtIndex || !pathAtIndex.curves) {
    // Handle the case when 'tabPaths[index]' is undefined or doesn't have 'curves'
    return null
  }
  const curves = pathAtIndex.curves
  const startPoint = curves[0].to
  const endPoint = curves[curves.length - 1].to
  const centerX = (startPoint.x + endPoint.x) / 2
  return centerX
}
