import React from 'react'
import { Link } from 'react-router-dom'
import {
  Footer,
  FooterBody,
  FooterPrimary,
  FooterSecondary,
  FooterLink,
  SmoothCodeLogo,
} from 'components'

export function AppFooter() {
  return (
    <Footer>
      <FooterBody>
        <FooterPrimary>
          <a
            href="https://www.smooth-code.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SmoothCodeLogo height={30} width={148} />
          </a>
        </FooterPrimary>
        <FooterSecondary>
          <FooterLink as={Link} to="/terms">
            Terms
          </FooterLink>
          <FooterLink as={Link} to="/privacy">
            Privacy
          </FooterLink>
          <FooterLink as={Link} to="/security">
            Security
          </FooterLink>
          <FooterLink
            href="https://docs.bundle-analyzer.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Docs
          </FooterLink>
        </FooterSecondary>
      </FooterBody>
    </Footer>
  )
}
