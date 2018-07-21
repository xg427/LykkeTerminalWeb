import * as React from 'react';

const CommonOrder: React.SFC<{}> = (props: any) => {
  return (
    <React.Fragment>
      {React.cloneElement(props.children, {...props})}
    </React.Fragment>
  );
};

export default CommonOrder;
