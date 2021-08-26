import React from 'react';
import styled from 'styled-components';

const StyledBadge = styled.span`
  display: table;
  border-spacing: var(--padding-xxs) 0;
  margin: 0px !important;
  span {
    display: table-cell;
    vertical-align: middle;
    padding: var(--padding-xxs) var(--padding-xs);
    text-transform: uppercase;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: #fff;
    border-radius: var(--radius-sm);
    text-shadow: 1px 1px 0px var(--hl-sm);
    transition: background-color 0.2s ease;
    &.post {
      background-color: rgba(var(--color-success-rgb));
    }
    &.get {
      background-color: rgba(var(--color-surprise-rgb));
    }
    &.delete {
      background-color: rgba(var(--color-danger-rgb));
      &:hover {
        background-color: var(--color-danger);
      }
    }
    &.parameters {
      display: none;
      margin-right: 0px !important;
    }
    &.options-head,
    &.custom {
      background-color: rgba(var(--color-info-rgb));
    }
    &.patch {
      background-color: rgba(var(--color-notice-rgb));
    }
    &.put {
      background-color: rgba(var(--color-warning-rgb), 0.8);
    }
    &:hover {
      cursor: default;
    }
  }
`;

export const Badge = ({ method = 'post', label = method }) => {
  return (
    <StyledBadge>
      <span className={method}>{label}</span>
    </StyledBadge>
  );
};
