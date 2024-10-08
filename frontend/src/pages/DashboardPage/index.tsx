import { FC, useCallback } from 'react'
import { useDashboardData } from './useDashboardData'
import { Alert } from '../../components/Alert'
import { PollCard } from '../../components/PollCard'
import { Layout } from '../../components/Layout'
import classes from './index.module.css'
import { Button } from '../../components/Button'
import { useNavigate } from 'react-router-dom'
import { InputFieldGroup } from '../../components/InputFields'
import { ProofOfStakeIcon } from '../../components/icons/ProofOfStake'

const NoPolls: FC<{ hasFilters: boolean; clearFilters: () => void }> = ({ hasFilters, clearFilters }) => {
  return (
    <div className={classes.noPolls}>
      <ProofOfStakeIcon />
      <h4>No polls here</h4>
      {hasFilters && (
        <p>
          You might want to{' '}
          <a href="#" onClick={clearFilters}>
            clean your filters
          </a>{' '}
          to see more.
        </p>
      )}
    </div>
  )
}

export const DashboardPage: FC = () => {
  const navigate = useNavigate()
  const {
    isLoadingPolls,
    typeFilteredProposals,
    reportVisibility,
    shouldShowInaccessiblePolls,
    leftFilterInputs,
    rightFilterInputs,
    searchPatterns,
    myVisibleCount,
    otherVisibleCount,
    hasFilters,
    clearFilters,
  } = useDashboardData()
  const handleCreate = useCallback(() => navigate('/create'), [navigate])

  const createButton = (
    <Button className={classes.createButton} onClick={handleCreate}>
      Create New
    </Button>
  )

  return (
    <Layout variation="dashboard" extraWidget={createButton}>
      <div className={classes.dashboardMain}>
        <div className={classes.dashboardMyColumn}>
          <InputFieldGroup fields={[leftFilterInputs]} />
          <div className={classes.dashboardLabel}>My polls</div>
          {isLoadingPolls ? (
            <Alert headerText="Please wait" type="loading" actions={<span>Fetching polls...</span>} />
          ) : (
            <>
              {typeFilteredProposals.map(proposal => (
                <PollCard
                  column={'mine'}
                  key={proposal.id}
                  proposal={proposal}
                  showInaccessible={shouldShowInaccessiblePolls}
                  reportVisibility={reportVisibility}
                  searchPatterns={searchPatterns}
                />
              ))}
              {!myVisibleCount && <NoPolls hasFilters={hasFilters} clearFilters={clearFilters} />}
            </>
          )}
        </div>
        <div className={classes.dashboardOtherColumn}>
          <InputFieldGroup fields={[rightFilterInputs]} alignRight />
          <div className={classes.dashboardLabel}>Explore polls</div>
          {isLoadingPolls ? (
            <Alert headerText="Please wait" type="loading" actions={<span>Fetching polls...</span>} />
          ) : (
            <>
              {typeFilteredProposals.map(proposal => (
                <PollCard
                  column={'others'}
                  key={proposal.id}
                  proposal={proposal}
                  showInaccessible={shouldShowInaccessiblePolls}
                  searchPatterns={searchPatterns}
                  reportVisibility={reportVisibility}
                />
              ))}
              {!otherVisibleCount && <NoPolls hasFilters={hasFilters} clearFilters={clearFilters} />}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
