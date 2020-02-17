import styled, { keyframes } from 'styled-components';

const loading = keyframes`
  from {
    background-position: 0 0;
    /* rotate: 0; */
  }

  to {
    background-position: 100% 100%;
    /* rotate: 360deg; */
  }
`;

const Form = styled.form`
  border: 1px solid #E1E1E1;
  border-radius: 10px;
  padding: 30px;
  font-size: 1.5rem;
  line-height: 1.5;
  font-weight: 600;
  label {
    display: block;
    margin-bottom: 1.5rem;
  }
  input,
  textarea,
  select {
    width: 100%;
    padding: 1rem;
    font-size: 1.2rem;
    border: 1px solid #ddd;
    &:focus {
      outline: 0;
      border-color: #777;
    }
  }
  button,
  input[type='submit'] {
    width: auto;
    background: #00B8D4;
    color: white;
    border: 0;
    font-size: 2rem;
    font-weight: 600;
    padding: 1rem 2rem;
    border-radius: 2px;
  }
  fieldset {
    border: 0;
    padding: 0;

    &[disabled] {
      opacity: 0.5;
    }
    &::before {
      height: 10px;
      content: '';
      display: block;
      background-image: linear-gradient(to right, #777 0%, #eee 50%, #777 100%);
    }
    &[aria-busy='true']::before {
      background-size: 50% auto;
      animation: ${loading} 0.5s linear infinite;
    }
  }
`;

export default Form;
