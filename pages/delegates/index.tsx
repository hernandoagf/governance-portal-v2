/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { useMemo, useState } from 'react';
import { Heading, Box, Flex, Card, Text, Button } from 'theme-ui';
import { GetStaticProps } from 'next';
import ErrorPage from 'modules/app/components/ErrorPage';
import { BigNumberJS } from 'lib/bigNumberJs';
import { useBreakpointIndex } from '@theme-ui/match-media';
import shallow from 'zustand/shallow';
import { Icon } from '@makerdao/dai-ui-icons';
import useSWR, { useSWRConfig } from 'swr';
import useDelegatesFiltersStore, { delegatesSortEnum } from 'modules/delegates/stores/delegatesFiltersStore';
import { isDefaultNetwork } from 'modules/web3/helpers/networks';
import { DelegateStatusEnum } from 'modules/delegates/delegates.constants';
import PrimaryLayout from 'modules/app/components/layout/layouts/Primary';
import SidebarLayout from 'modules/app/components/layout/layouts/Sidebar';
import Stack from 'modules/app/components/layout/layouts/Stack';
import ResourceBox from 'modules/app/components/ResourceBox';
import { DelegateOverviewCard } from 'modules/delegates/components';
import PageLoadingPlaceholder from 'modules/app/components/PageLoadingPlaceholder';
import { HeadComponent } from 'modules/app/components/layout/Head';
import { DelegatesSystemInfo } from 'modules/delegates/components/DelegatesSystemInfo';
import { DelegatesStatusFilter } from 'modules/delegates/components/filters/DelegatesStatusFilter';
import { DelegatesSortFilter } from 'modules/delegates/components/filters/DelegatesSortFilter';
import { DelegatesCvcFilter } from 'modules/delegates/components/filters/DelegatesCvcFilter';
import { DelegatesShowExpiredFilter } from 'modules/delegates/components/filters/DelegatesShowExpiredFilter';
import { filterDelegates } from 'modules/delegates/helpers/filterDelegates';
import { useAccount } from 'modules/app/hooks/useAccount';
import { useWeb3 } from 'modules/web3/hooks/useWeb3';
import { ErrorBoundary } from 'modules/app/components/ErrorBoundary';
import { InternalLink } from 'modules/app/components/InternalLink';
import { DelegatesPageData, fetchDelegatesPageData } from 'modules/delegates/api/fetchDelegatesPageData';
import { SupportedNetworks } from 'modules/web3/constants/networks';
import { SearchBar } from 'modules/app/components/filters/SearchBar';
import { getTestBreakout } from 'modules/app/helpers/getTestBreakout';

const Delegates = ({ delegates, stats, cvcs }: DelegatesPageData) => {
  const { voteDelegateContractAddress } = useAccount();
  const [showConstitutional, showShadow, showExpired, sort, name, delegateCvcs, setName, resetFilters] =
    useDelegatesFiltersStore(
      state => [
        state.filters.showConstitutional,
        state.filters.showShadow,
        state.filters.showExpired,
        state.sort,
        state.filters.name,
        state.filters.cvcs,
        state.setName,
        state.resetFilters
      ],
      shallow
    );

  // only for mobile
  const [showFilters, setShowFilters] = useState(false);
  const bpi = useBreakpointIndex();

  const filteredDelegates = useMemo(() => {
    return filterDelegates(delegates, showShadow, showConstitutional, showExpired, name, delegateCvcs);
  }, [delegates, showConstitutional, showShadow, showExpired, name, delegateCvcs]);

  const isOwner = d => d.voteDelegateAddress.toLowerCase() === voteDelegateContractAddress?.toLowerCase();

  const [sortedDelegates, constitutionalDelegates, shadowDelegates, expiredDelegates] = useMemo(() => {
    const sorted = filteredDelegates.sort((prev, next) => {
      if (sort === delegatesSortEnum.creationDate) {
        return prev.expirationDate > next.expirationDate ? -1 : 1;
      } else if (sort === delegatesSortEnum.mkrDelegated) {
        return new BigNumberJS(prev.mkrDelegated).gt(new BigNumberJS(next.mkrDelegated)) ? -1 : 1;
      } else if (sort === delegatesSortEnum.random) {
        return delegates.indexOf(prev) > delegates.indexOf(next) ? 1 : -1;
      }

      return 1;
    });

    const constitutional = sorted
      .filter(delegate => delegate.status === DelegateStatusEnum.constitutional && !delegate.expired)
      .sort(d => (isOwner(d) ? -1 : 0));

    const shadow = sorted
      .filter(delegate => delegate.status === DelegateStatusEnum.shadow && !delegate.expired)
      .sort(d => (isOwner(d) ? -1 : 0));

    const expired = sorted.filter(delegate => delegate.expired === true);
    return [sorted, constitutional, shadow, expired];
  }, [filteredDelegates, sort]);

  return (
    <PrimaryLayout sx={{ maxWidth: [null, null, null, 'page', 'dashboard'] }}>
      <HeadComponent
        title="Delegates"
        description="Vote delegation allows for MKR holders to delegate their voting power to delegates, which increases the effectiveness and efficiency of the governance process."
        image={'https://vote.makerdao.com/seo/delegates.png'}
      />
      <Stack>
        <Flex sx={{ alignItems: 'center', flexDirection: ['column', 'row'] }}>
          <Flex sx={{ alignItems: 'center' }}>
            <Button
              variant="textual"
              sx={{ display: ['block', 'none'], color: 'onSecondary' }}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Text sx={{ mr: 1 }}>{showFilters ? 'Hide delegate filters' : 'Show delegate filters'}</Text>
              <Icon name={showFilters ? 'chevron_down' : 'chevron_right'} size={2} />
            </Button>
          </Flex>
          {(showFilters || bpi > 0) && (
            <Flex sx={{ flexDirection: ['column', 'column', 'column', 'row'] }}>
              <Flex
                sx={{
                  justifyContent: ['center', 'center', 'center', 'flex-start'],
                  alignItems: 'center',
                  flexWrap: 'wrap'
                }}
              >
                <SearchBar sx={{ m: 2 }} onChange={setName} value={name} placeholder="Search by name" />
                <DelegatesSortFilter />
                <DelegatesCvcFilter cvcs={cvcs} delegates={delegates} sx={{ ml: 2 }} />
                <DelegatesStatusFilter delegates={delegates}  />
                <DelegatesShowExpiredFilter sx={{ ml: 2 }} />
              </Flex>
              <Button
                variant={'outline'}
                data-testid="delegate-reset-filters"
                sx={{
                  m: 2,
                  color: 'textSecondary',
                  border: 'none'
                }}
                onClick={resetFilters}
              >
                Reset filters
              </Button>
            </Flex>
          )}
        </Flex>

        <SidebarLayout>
          <Box>
            <Stack gap={3}>
              {sortedDelegates && sortedDelegates.length === 0 && (
                <Flex sx={{ flexDirection: 'column', alignItems: 'center', pt: [5, 5, 5, 6] }}>
                  <Flex
                    sx={{
                      borderRadius: '50%',
                      backgroundColor: 'secondary',
                      p: 2,
                      width: '111px',
                      height: '111px',
                      alignItems: 'center'
                    }}
                  >
                    <Box m={'auto'}>
                      <Icon name="magnifying_glass" sx={{ color: 'background', size: 4 }} />
                    </Box>
                  </Flex>
                  <Text variant={'microHeading'} sx={{ color: 'onSecondary', mt: 3 }}>
                    No delegates found
                  </Text>
                  <Button
                    variant={'textual'}
                    sx={{ color: 'primary', textDecoration: 'underline', mt: 2, fontSize: 3 }}
                    onClick={resetFilters}
                  >
                    Reset filters
                  </Button>
                </Flex>
              )}

              {constitutionalDelegates.length > 0 && (
                <Stack gap={3}>
                  <Heading as="h1">Constitutional Delegates</Heading>

                  {constitutionalDelegates.map(delegate => (
                    <Box key={delegate.id} sx={{ mb: 3 }}>
                      <ErrorBoundary componentName="Delegate Card">
                        <DelegateOverviewCard delegate={delegate} />
                      </ErrorBoundary>
                    </Box>
                  ))}
                </Stack>
              )}

              {shadowDelegates.length > 0 && (
                <Stack gap={3}>
                  <Heading as="h1">Shadow Delegates</Heading>

                  {shadowDelegates.map(delegate => (
                    <Box key={delegate.id} sx={{ mb: 3 }}>
                      <ErrorBoundary componentName="Delegate Card">
                        <DelegateOverviewCard delegate={delegate} />
                      </ErrorBoundary>
                    </Box>
                  ))}
                </Stack>
              )}

              {expiredDelegates.length > 0 && (
                <Stack gap={3}>
                  <Heading as="h1">Expired Delegates</Heading>

                  {expiredDelegates.map(delegate => (
                    <Box key={delegate.id} sx={{ mb: 3 }}>
                      <ErrorBoundary componentName="Delegate Card">
                        <DelegateOverviewCard delegate={delegate} />
                      </ErrorBoundary>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>
          </Box>

          <Stack gap={3}>
            <Box>
              <Heading mt={3} mb={2} as="h3" variant="microHeading">
                Delegate Contracts
              </Heading>
              <Card variant="compact">
                <Text as="p" sx={{ mb: 3, color: 'textSecondary' }}>
                  {voteDelegateContractAddress
                    ? 'Looking for delegate contract information?'
                    : 'Interested in creating a delegate contract?'}
                </Text>
                <Box>
                  <InternalLink
                    href={'/account'}
                    title="My account"
                    // TODO: onClick={() => trackButtonClick('viewAccount')}
                  >
                    <Text color="accentBlue">View Account Page</Text>
                  </InternalLink>
                </Box>
              </Card>
            </Box>
            {stats && (
              <ErrorBoundary componentName="Delegates System Info">
                <DelegatesSystemInfo stats={stats} />
              </ErrorBoundary>
            )}
            <ResourceBox type={'delegates'} />
            <ResourceBox type={'general'} />
          </Stack>
        </SidebarLayout>
      </Stack>
    </PrimaryLayout>
  );
};

export default function DelegatesPage({
  delegates: prefetchedDelegates,
  stats: prefetchedStats,
  cvcs: prefetchedCvcs
}: DelegatesPageData): JSX.Element {
  const { network } = useWeb3();

  const fallbackData = isDefaultNetwork(network)
    ? {
        delegates: prefetchedDelegates,
        cvcs: prefetchedCvcs
      }
    : null;

  const { cache } = useSWRConfig();
  const cacheKey = `page/delegates/${network}`;
  const { data, error } = useSWR<DelegatesPageData>(
    !network || isDefaultNetwork(network) ? null : cacheKey,
    () => fetchDelegatesPageData(network, true),
    {
      revalidateOnMount: !cache.get(cacheKey),
      ...(fallbackData && { fallbackData })
    }
  );

  if (!isDefaultNetwork(network) && !data && !error) {
    return <PageLoadingPlaceholder />;
  }

  if (error) {
    return (
      <PrimaryLayout sx={{ maxWidth: 'dashboard' }}>
        <ErrorPage statusCode={500} title="Error fetching data. Please, try again later." />
      </PrimaryLayout>
    );
  }

  const props = {
    delegates: isDefaultNetwork(network) ? prefetchedDelegates : data?.delegates || [],
    stats: isDefaultNetwork(network) ? prefetchedStats : data?.stats || undefined,
    cvcs: isDefaultNetwork(network) ? prefetchedCvcs : data?.cvcs || []
  };

  return (
    <ErrorBoundary componentName="Delegates List">
      <Delegates {...props} />
    </ErrorBoundary>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // Don't fetch mainnet data while running tests since it will be refetched client-side anyway
  if (getTestBreakout()) {
    return {
      props: {
        delegates: [],
        cvcs: [],
        stats: []
      }
    };
  }

  const { delegates, stats, cvcs } = await fetchDelegatesPageData(SupportedNetworks.MAINNET);

  return {
    revalidate: 60 * 30, // allow revalidation every 30 minutes
    props: {
      // Shuffle in the backend, this will be changed depending on the sorting order.
      delegates,
      cvcs,
      stats
    }
  };
};
