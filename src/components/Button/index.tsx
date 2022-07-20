import { FunctionComponent } from "react"

import classnames from "classnames"

import styles from "./Button.module.css"

type ButtonProps = {
  onClick?: () => void
  children: React.ReactNode
  className?: string
  color?: "primary" | "secondary"
}

const Button: FunctionComponent<ButtonProps> = ({
  onClick,
  children,
  className,
  color = "primary",
}) => {
  return (
    <button
      className={classnames(styles.button, className, styles[color])}
      onClick={onClick}>
      {children}
    </button>
  )
}

export default Button
