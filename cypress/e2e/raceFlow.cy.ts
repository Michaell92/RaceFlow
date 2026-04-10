describe('Race Flow', () => {
  beforeEach(() => {
    cy.viewport(1440, 900)
    cy.visit('/')
  })

  it('generates a program with 6 rounds of 10 horses each', () => {
    cy.contains('button', 'Generate Program').click()

    cy.contains('Race Program').should('be.visible')

    for (let i = 1; i <= 6; i++) {
      cy.contains(`Round ${i}`).should('exist')
    }
  })

  it('starts a race and shows horses animating on track', () => {
    cy.contains('button', 'Generate Program').click()
    cy.contains('button', 'Start').click()

    cy.contains('RACING').should('be.visible')
    cy.get('.race-track__lane').should('have.length', 10)
  })

  it('shows results after a round completes', () => {
    cy.contains('button', 'Generate Program').click()
    cy.contains('button', 'Start').click()

    // Wait for the round to finish — button changes to "Next Round"
    cy.contains('button', 'Next Round', { timeout: 30_000 }).should('be.visible')

    // Results section should now contain Round 1
    cy.get('.race-results').within(() => {
      cy.contains('Round 1').should('be.visible')
    })
  })

  it('can start the next round manually', () => {
    cy.contains('button', 'Generate Program').click()
    cy.contains('button', 'Start').click()

    cy.contains('button', 'Next Round', { timeout: 30_000 }).click()

    // Second round should now be racing
    cy.contains('RACING').should('be.visible')
    cy.contains('Round 2').should('exist')
  })

  it('runs through all 6 rounds with auto-play', () => {
    cy.contains('button', 'Generate Program').click()
    cy.contains('button', 'Start').click()

    // Wait for first round to finish
    cy.contains('button', 'Next Round', { timeout: 30_000 }).should('be.visible')

    // Enable auto-play, then trigger next round
    cy.contains('Auto-play').click()
    cy.contains('button', 'Next Round').click()

    // Auto-play completes remaining rounds automatically
    cy.contains('FINISHED', { timeout: 120_000 }).should('be.visible')
  })

  it('resets when generating a new program', () => {
    cy.contains('button', 'Generate Program').click()
    cy.contains('button', 'Start').click()

    // Wait for first round to finish
    cy.contains('button', 'Next Round', { timeout: 30_000 }).should('be.visible')

    cy.contains('button', 'Next Round').click()

    // Wait for round to finish
    cy.contains('button', 'Next Round', { timeout: 30_000 }).should('be.visible')

    // Generate a new program — should reset results
    cy.contains('button', 'Generate Program').click()

    cy.get('.race-results').within(() => {
      cy.contains('No results yet').should('be.visible')
    })

    // Program still shows 6 rounds
    cy.contains('Round 1').should('be.visible')
  })

  it('pauses and resumes a race', () => {
    cy.contains('button', 'Generate Program').click()
    cy.contains('button', 'Start').click()

    cy.contains('RACING').should('be.visible')

    // Pause
    cy.contains('button', 'Pause').click()
    cy.contains('PAUSED').should('be.visible')

    // Resume
    cy.contains('button', 'Resume').click()
    cy.contains('RACING').should('be.visible')

    // Let the round finish
    cy.contains('button', 'Next Round', { timeout: 30_000 }).should('be.visible')
  })
})
