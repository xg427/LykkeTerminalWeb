import randomString from '../randomString';

describe('method mixed', () => {
  it('should return a string with the length from parameters', () => {
    const length = 10;
    expect(randomString().mixed(length).length).toBe(length);
  });

  it('should return a random string consist of letters and numbers only', () => {
    const length = 100;
    const firstRandomString = randomString().mixed(length);
    const secondRandomString = randomString().mixed(length);
    const thirdRandomString = randomString().mixed(length);
    const validator = /^[a-zA-Z0-9]+$/;
    expect(validator.test(firstRandomString)).toBe(true);
    expect(validator.test(secondRandomString)).toBe(true);
    expect(validator.test(thirdRandomString)).toBe(true);
    expect(firstRandomString).not.toEqual(secondRandomString);
    expect(firstRandomString).not.toEqual(thirdRandomString);
    expect(secondRandomString).not.toEqual(thirdRandomString);
  });
});
