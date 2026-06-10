declare module "react-simple-maps" {
  import { FC, ReactNode, CSSProperties, MouseEvent, KeyboardEvent, FocusEvent } from "react"

  export interface GeoFeature {
    rsmKey: string
    id: string
    [key: string]: unknown
  }

  export interface GeographiesChildrenArgs {
    geographies: GeoFeature[]
  }

  export interface Position {
    coordinates: [number, number]
    zoom: number
  }

  export const ComposableMap: FC<{
    projectionConfig?: { scale?: number; center?: [number, number] }
    width?: number
    height?: number
    style?: CSSProperties
    children?: ReactNode
  }>

  export const ZoomableGroup: FC<{
    center?: [number, number]
    zoom?: number
    minZoom?: number
    maxZoom?: number
    onMoveEnd?: (position: Position) => void
    children?: ReactNode
  }>

  export const Geographies: FC<{
    geography: string
    children: (args: GeographiesChildrenArgs) => ReactNode
  }>

  export const Geography: FC<{
    geography: GeoFeature
    fill?: string
    stroke?: string
    strokeWidth?: number
    tabIndex?: number
    role?: string
    "aria-label"?: string
    onClick?: (evt: MouseEvent) => void
    onKeyDown?: (evt: KeyboardEvent) => void
    onFocus?: (evt: FocusEvent) => void
    onBlur?: (evt: FocusEvent) => void
    onMouseEnter?: (evt: MouseEvent) => void
    onMouseMove?: (evt: MouseEvent) => void
    onMouseLeave?: (evt: MouseEvent) => void
    style?: {
      hover?: CSSProperties & { cursor?: string }
      pressed?: CSSProperties
      default?: CSSProperties
    }
  }>
}
