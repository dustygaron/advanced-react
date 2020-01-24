describe('sample test 101', () => {
  test('works as expected', () => {
    const age = 100
    expect(1).toEqual(1)
    expect(age).toEqual(100)
  })
})

it('handles ranges just fine', () => {
  const age = 200
  expect(age).toBeGreaterThan(100)
})

it('makes a list of dog names', () => {
  const dogs = ['Harry', 'Bower']
  expect(dogs).toEqual(dogs)
  expect(dogs).toContain('Bower')
})