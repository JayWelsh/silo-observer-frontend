import React from 'react';

import { Link } from "react-router-dom";

import { ExternalLink } from './ExternalLink';

interface ILinkWrapper {
  link?: string,
  external?: boolean,
  className?: string,
  children: React.ReactNode,
  onClick?: () => void,
  decorate?: boolean,
}

// we use this component to dynamically handle internal links and external links

const LinkWrapper = (props: ILinkWrapper) => {
  const {
    link,
    external = false,
    className,
    children,
    onClick,
    decorate = false,
  } = props;
  if(external && link) {
    return (
      <ExternalLink decorate={decorate} className={[className, decorate ? '' : 'no-decorate', 'inherit-color'].join(" ")} href={link}>
        {children}
      </ExternalLink>
    )
  }
  if(!external && link) {
    return (
      <Link onClick={() => onClick && onClick()} className={[className, decorate ? '' : 'no-decorate', 'inherit-color'].join(" ")} to={`${link}`}>
        {children}
      </Link>
    )
  }
  return (
    <>
      {children}
    </>
  );
}

export default LinkWrapper;