import styled from 'styled-components';

const px2em = (num) => `${parseInt(num)/16}rem`

export const MapContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

export const RadioContainer = styled.div`
  display: flex;
  grid-gap: ${px2em(12)};
`;

export const MapInfoContainer = styled(RadioContainer)`
  grid-gap: ${px2em(20)};

  div {
    position: relative;

    &:after {
      content: '•';
      position: absolute;
      left: calc(100% + ${px2em(6)});
      font-size: ${px2em(24)};
      line-height: 1;
    }

    &:last-of-type {
      &:after {
        display: none;
      }
    }
  }

  span {
    font-weight: 500;
    display: inline-block;

    &:after {
      content: ':';
      padding-right: ${px2em(3)};
    }

    &:last-of-type {
      font-weight: 400;
      white-space: nowrap;

      &:after {
        display: none;
      }

    }
  }
`;

export const MapDataContainer = styled(MapInfoContainer)`
  display: grid;
  grid-gap: 0 ${px2em(20)};
  grid-template-columns: max-content max-content;
  margin-top: ${px2em(8)};
  padding-top: ${px2em(8)};
  border-top: 1px solid var(--gray);

  div {
    &:after {
      display: none;
    }
  }
`;

export const RadioLabel = styled.label`
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  grid-gap: ${px2em(8)};
  width: min-content;
  font-weight: 500;
`;

const BaseContainerStyle = styled.div`
  position: absolute;
  box-shadow: 0 0 0 ${px2em(2)} var(--gray);
  background-color: var(--white);
  z-index: 1;
  border-radius: ${px2em(4)};
  transition: width 0.25s, min-width 0.25s;
  color: var(--black);
`;

export const DataContainerStyle = styled(BaseContainerStyle)`
  top: ${px2em(46)};
  width: 100%;
  right: ${px2em(39)};
  margin: ${px2em(10)};
  margin-left: 0;
  max-width: ${px2em(258)};
  padding: ${px2em(6)} ${px2em(8)};
`;

export const ResultsContainerStyle = styled(BaseContainerStyle)`
  top: ${px2em(10)};
  left: ${px2em(10)};
  width: auto;
  padding: ${px2em(8)} ${px2em(12)};
`;


export const RangeContainerStyle = styled.div`
  display: grid;
  grid-template-areas:
    'title title'
    'range range';
`;

export const RangeInputStyled = styled.input`
  grid-area: range;
`;

export const RangeTitleStyled = styled.div`
  grid-area: title;
`;
