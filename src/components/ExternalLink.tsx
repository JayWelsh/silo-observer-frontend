import React, { HTMLProps, useCallback } from 'react'
import styled from 'styled-components'

interface IStyledLink {
  decorate: boolean,
}

const StyledLink = styled.a<IStyledLink>`
  ${props => props.decorate ? '' : 'text-decoration: none;'}
  cursor: pointer;
  font-weight: 500;

  color: inherit;

  :focus {
    outline: none;
  }

  :active {
    text-decoration: none;
  }
`

export function ExternalLink({
    target = '_blank',
    href,
    rel = 'noopener noreferrer',
    decorate = false,
    ...rest
  }: Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> & { href: string, decorate?: boolean }) {
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLAnchorElement>) => {
        // don't prevent default, don't redirect if it's a new tab
        if (target === '_blank' || event.ctrlKey || event.metaKey) {
            // Nothing
        } else {
          event.preventDefault()
        }
      },
      [target]
    )
    return <StyledLink decorate={decorate} target={target} rel={rel} href={href} onClick={handleClick} {...rest} />
}