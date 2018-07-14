import {shallow} from 'enzyme';
import * as React from 'react';
import {
  disclaimedAssets,
  disclaimerMessages
} from '../../../constants/assetDisclaimer';
import {Disclaimer} from '../Disclaimer';

describe('<Disclaimer>', () => {
  const disclaimerAsset = disclaimedAssets[0];

  const getTestDisclaimer = (asset: any) => <Disclaimer asset={asset} />;

  it('should render disclaimer', () => {
    const wrapper = shallow(getTestDisclaimer(disclaimerAsset));
    expect(wrapper.find('DisclaimerNotification')).toHaveLength(1);
  });

  it('should return null for right asset', () => {
    const asset = 'BTC';
    expect(disclaimedAssets.every((da: string) => da !== asset));

    const wrapper = shallow(getTestDisclaimer(asset));
    expect(wrapper.find('DisclaimerNotification')).toHaveLength(0);
  });

  it('should render link if link presents in disclaimerMessages', () => {
    const asset = 'EOS';
    const assetWithLink = disclaimerMessages[asset];
    expect(assetWithLink.link).toBeDefined();

    const wrapper = shallow(getTestDisclaimer(asset));
    const link = wrapper.find('Link');
    expect(link).toHaveLength(1);
    expect(link.props().href).toBe(assetWithLink.link);
  });

  it('should not render link if link presents in disclaimerMessages', () => {
    const asset = 'VET';
    const wrapper = shallow(getTestDisclaimer(asset));
    expect(wrapper.find('Link')).toHaveLength(0);
  });
});
