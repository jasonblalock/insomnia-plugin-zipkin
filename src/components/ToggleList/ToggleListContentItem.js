function ToggleListContentItem({
  id,
  label,
  isChecked,
  onToggleChange,
  ...props
}) {
  return (
    <StyledContentListItem indentLevel={2}>
      <div>
        <Button variant="text" disabled>
          <SvgIcon icon="indentation" />
        </Button>
        <label htmlFor={id}>Send generated trace ID</label>
        <StyledToggleSwitch>
          <ToggleSwitch
            id={id}
            checked={dataQuery.data.generateTraceId}
            onChange={handleGenerateTraceIdToggleChange}
            disabled={!dataQuery.data.isEnabled}
            {...props}
          />
        </StyledToggleSwitch>
      </div>
    </StyledContentListItem>
  );
}
