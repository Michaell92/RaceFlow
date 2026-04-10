describe('Horse List', () => {
  beforeEach(() => {
    cy.viewport(1440, 900)
    cy.visit('/')
  })

  it('displays 20 horses in the list', () => {
    cy.contains('Horse List').should('be.visible')
    cy.get('.horse-list-table__table tbody tr').should('have.length', 20)
  })

  it('each horse has a color badge and condition bar', () => {
    cy.get('.horse-list-table__color-badge').should('have.length', 20)
    cy.get('.horse-list-table__condition-bar').should('have.length', 20)
  })

  it('all conditions are between 1 and 100', () => {
    cy.get('.horse-list-table__condition-label').each(($el) => {
      const value = Number($el.text())
      expect(value).to.be.at.least(1)
      expect(value).to.be.at.most(100)
    })
  })
})
