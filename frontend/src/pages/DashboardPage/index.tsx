import { FC, useCallback } from 'react'
import { useDashboardData } from './useDashboardData'
import { Alert } from '../../components/Alert'
import { PollCard } from '../../components/PollCard'
import { Layout } from '../../components/Layout'
import classes from './index.module.css'
import { Button } from '../../components/Button'
import { useNavigate } from 'react-router-dom'
import { InputFieldGroup, TextInput } from '../../components/InputFields'
import { dashboardFiltering } from '../../constants/config'

export const DashboardPage: FC = () => {
  const navigate = useNavigate()
  const {
    isLoadingPolls,
    myProposals,
    otherProposals,
    registerOwnership,
    registerMatch,
    hideInaccessible,
    wantedPollType,
    pollSearchPatternInput,
    searchPatterns,
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
          {dashboardFiltering.enabled && <TextInput {...pollSearchPatternInput} />}
          <div className={classes.dashboardLabel}>My polls</div>
          {isLoadingPolls ? (
            <Alert headerText="Please wait" type="loading" actions={<span>Fetching polls...</span>} />
          ) : (
            myProposals.map(proposal => (
              <PollCard
                key={proposal.id}
                proposal={proposal}
                hideInaccessible={dashboardFiltering.enabled && hideInaccessible.value}
                registerOwnership={registerOwnership}
                searchPatterns={searchPatterns}
                registerMatch={registerMatch}
              />
            ))
          )}
        </div>
        <div className={classes.dashboardOtherColumn}>
          {dashboardFiltering.enabled && <InputFieldGroup fields={[[wantedPollType, hideInaccessible]]} />}
          <div className={classes.dashboardLabel}>Explore polls</div>
          {isLoadingPolls ? (
            <Alert headerText="Please wait" type="loading" actions={<span>Fetching polls...</span>} />
          ) : (
            otherProposals.map(proposal => (
              <PollCard
                key={proposal.id}
                proposal={proposal}
                registerOwnership={registerOwnership}
                hideInaccessible={dashboardFiltering.enabled && hideInaccessible.value}
                searchPatterns={searchPatterns}
                registerMatch={registerMatch}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
