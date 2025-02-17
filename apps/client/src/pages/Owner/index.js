import React from 'react'
import gql from 'graphql-tag'
import { Route, Link } from 'react-router-dom'
import { Box } from '@xstyled/styled-components'
import { FaGithub } from 'react-icons/fa'
import { Helmet } from 'react-helmet'
import {
  Header,
  HeaderBody,
  HeaderTitle,
  HeaderPrimary,
  HeaderSecondaryLink,
  TabList,
  RouterTabItem,
  Container,
  FadeLink,
} from 'components'
import { Query } from 'containers/Apollo'
import { OwnerAvatar } from 'containers/OwnerAvatar'
import { hasWritePermission } from 'modules/permissions'
import { OwnerProvider, useOwner } from './OwnerContext'
import { OwnerRepositories } from './Repositories'
import { OwnerSettings } from './Settings'

function OwnerHeader() {
  const owner = useOwner()
  return (
    <Header>
      <HeaderBody>
        <HeaderPrimary>
          <HeaderTitle>
            <OwnerAvatar owner={owner} mr={2} />
            {owner.login}
          </HeaderTitle>
          <HeaderSecondaryLink
            target="_blank"
            rel="noopener noreferrer"
            href={`https://github.com/${owner.login}`}
          >
            <Box forwardedAs={FaGithub} mr={1} /> {owner.login}
          </HeaderSecondaryLink>
        </HeaderPrimary>
        <TabList>
          <RouterTabItem exact to={`/gh/${owner.login}`}>
            Repositories
          </RouterTabItem>
          {hasWritePermission(owner) ? (
            <RouterTabItem to={`/account/gh/${owner.login}`}>
              Settings
            </RouterTabItem>
          ) : null}
        </TabList>
      </HeaderBody>
    </Header>
  )
}

export function Owner({
  match: {
    params: { ownerLogin },
  },
}) {
  return (
    <Query
      query={gql`
        query Owner($login: String!) {
          owner(login: $login) {
            id
            name
            login
            permissions
          }
        }
      `}
      variables={{ login: ownerLogin }}
    >
      {({ owner }) => {
        if (!owner) {
          return (
            <Container textAlign="center" my={4}>
              <p>Organization or user not found.</p>
              <p>
                <FadeLink forwardedAs={Link} color="white" to="/">
                  Back to home
                </FadeLink>
              </p>
            </Container>
          )
        }
        return (
          <OwnerProvider owner={owner}>
            <>
              <Helmet
                titleTemplate={`%s - ${owner.login}`}
                defaultTitle={owner.login}
              />
              <OwnerHeader />
              <Route
                exact
                path={`/gh/${owner.login}`}
                component={OwnerRepositories}
              />
              {hasWritePermission(owner) ? (
                <Route
                  path={`/account/gh/${ownerLogin}`}
                  component={OwnerSettings}
                />
              ) : null}
            </>
          </OwnerProvider>
        )
      }}
    </Query>
  )
}
