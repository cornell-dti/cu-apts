import React, { ReactElement } from 'react';

const SectionDivider = (): ReactElement => {
  return (
    <div>
      <h4 style={{ textAlign: 'center', paddingTop: 20, paddingBottom: 10 }}>
        Browse Renting Companies
      </h4>
      <hr className="divider" />
    </div>
  );
};

export default SectionDivider;
