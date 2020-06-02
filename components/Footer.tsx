import styled from 'styled-components';
import { QRCode } from 'react-qr-svg';

import Link from 'next/link';

import {
  Flex,
  Grid,
  Box,
  Input,
  Button,
  Text,
} from '@theme-ui/components';
import { Icon } from '@makerdao/dai-ui-icons';

import { translate } from '@makerdao/i18n-helper';

const FooterContainer = styled.footer`
  font-size: 1.5rem;
  padding: 3.6rem 2.5rem 2.7rem 2.5rem;
  width: 100%;
  background-color: #FFFFFF;
`;
// background-color: ${props => props.theme.footer.backgroundColor};
const LinkListHeader = styled.div`
  font-weight: 500;
  margin-bottom: 0.7rem;
  color: #333333;
`;

const LinkList = styled.ul`
  padding-left: 0;
  list-style: none;
  line-height: 3.1rem;
  & a {
    color: #7E7E88;
    font-weight: 400;
    transition: color 0.2s ease-out;
    text-decoration: none;
  }
  & a:hover {
    color: #231536;
  }
`;

const SignUpText = styled.div`
  max-width: 32.6rem;
  text-align: justify;
`;

const SubscribeButton = styled.button`
  border: none;
  font-size: 1em;
  background-color: transparent;
  color: #9898a6;
  transition: color 0.125s;
  cursor: pointer;
  display: inline;
  padding-right: 1rem;
  &:hover:after,
  &:focus:after {
    transform: translate(0.3rem);
    background-color: #53546a;
  }
  &:hover,
  &:focus {
    outline: none;
    color: #53546a;
  }
  &:after {
    content: '';
    mask: url(${props => props.rightCaret}) center center no-repeat;
    transition: all 0.125s;
    background-color: #9898a6;
    position: absolute;
    height: 1.8rem;
    width: 1.3rem;
  }
  input:focus + & {
    color: #53546a;
    &:after {
      background-color: #53546a;
    }
  }
`;

const Icons = styled(Grid)`
  & svg {
    width: 20px;
    height: 20px;
    transition: opacity 0.2s;
    cursor: pointer;
    opacity: 0.8;
    &:hover {
      opacity: 1;
    }
  }
`;

const url = require("url");

const withInternalLink = (InternalLinkComponent, host) => {
  class InternalLink extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      const UniversalURL = (url && url.URL) || URL;
      const to = new UniversalURL(this.props.to);

      if (InternalLinkComponent && to.host === host && !this.props.external) {
        return (
          <InternalLinkComponent to={to.pathname}>
            {this.props.children}
          </InternalLinkComponent>
        );
      } else {
        return (
          <a href={this.props.to} target="_blank" rel="noopener noreferrer">
            {this.props.children}
          </a>
        );
      }
    }
  }

  return InternalLink;
};

// eslint-disable-next-line
const rfc2822EmailRegex = /[a-z0-9!#$%&'*+\/=?^_{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9][a-z0-9-]*[a-z0-9]/;

/**
 *Global footer component.
 */
class Footer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      message: '',
      subscribeState: '',
      showWeChatModal: false,
    };

    this.Link = withInternalLink(Link, this.props.host);

    this.subscribeEmail = this.subscribeEmail.bind(this);
    this.updateEmail = this.updateEmail.bind(this);
    this.toggleWeChatModal = this.toggleWeChatModal.bind(this);
  }

  updateEmail(evt) {
    this.setState({
      email: evt.target.value,
      message: '',
      subscribeState: '',
    });
  }

  subscribeEmail() {
    const httpRequest = new XMLHttpRequest();

    if (!rfc2822EmailRegex.test(this.state.email)) {
      this.setState({
        message: 'Please enter a valid email address.',
        subscribeState: 'failure',
      });
      return;
    }

    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          this.setState({
            email: '',
            message: `Thank you. You'll hear from us soon.`,
            subscribeState: 'success',
          });
        } else {
          this.setState({
            message: 'An error occurred. Please try again later.',
            subscribeState: 'failure',
          });
        }
      }
    };

    httpRequest.onerror = () => {
      this.setState({
        message: 'An error occurred. Please try again later.',
        subscribeState: 'failure',
      });
    };

    httpRequest.open(
      'POST',
      'https://578v7re7h2.execute-api.us-east-2.amazonaws.com/default/addContactToMailingList',
      true
    );
    httpRequest.setRequestHeader('Content-Type', 'application/json');

    httpRequest.send(
      JSON.stringify({
        email: this.state.email,
      })
    );
  }

  toggleWeChatModal() {
    this.setState({
      showWeChatModal: !this.state.showWeChatModal,
    });
  }

  render() {
    const Link = this.Link;
    const t = text => translate(text, this.props.locale);

    return (
      <FooterContainer>
        <Grid
          sx={{ maxWidth: '11'}}
          m='0 auto'
          columns={[
            '1fr',
            '1fr 1fr',
            '1fr 1fr',
            'repeat(4, 1fr) auto',
          ]}
          gap='2rem'
        >
          <div>
            <LinkListHeader>{t('Learn')}</LinkListHeader>
            <LinkList>
              <li>
                <Link to='https://makerdao.com/whitepaper'>
                  {t('White Paper')}
                </Link>
              </li>
              <li>
                <Link to='https://makerdao.com/privacy'>
                  {t('Privacy Policy')}
                </Link>
              </li>
              <li>
                <Link to='https://makerdao.com/roadmap'>{t('Roadmap')}</Link>
              </li>
            </LinkList>
          </div>
          <div>
            <LinkListHeader>{t('Products')}</LinkListHeader>
            <LinkList>
              <li>
                <Link to='https://makerdao.com/dai'>{t('Dai Stablecoin')}</Link>
              </li>
              <li>
                <Link to={`https://${t('cdp-portal-subdomain')}.makerdao.com`}>
                  {t('CDP Portal')}
                </Link>
              </li>
              <li>
                <Link to='https://vote.makerdao.com'>{t('Governance')}</Link>
              </li>
              <li>
                <Link to='https://mkr.tools'>{t('Platform Data')}</Link>
              </li>
            </LinkList>
          </div>
          <div>
            <LinkListHeader>{t('Developer')}</LinkListHeader>
            <LinkList>
              <li>
                <Link to='https://makerdao.com/documentation/' external>
                  {t('Documentation')}
                </Link>
              </li>
              <li>
                <Link to='https://github.com/makerdao/dai.js'>Dai.js</Link>
              </li>
              <li>
                <Link to='https://developer.makerdao.com/dai/1/graphql/'>
                  GraphQL API
                </Link>
              </li>
            </LinkList>
          </div>
          <div>
            <LinkListHeader>{t('Foundation')}</LinkListHeader>
            <LinkList>
              <li>
                <Link to='https://makerdao.com/team'>{t('Team')}</Link>
              </li>
              <li>
                <Link to='https://makerdao.com/careers'>{t('Careers')}</Link>
              </li>
              <li>
                <Link to='https://makerdao.com/contact'>{t('Contact')}</Link>
              </li>
            </LinkList>
          </div>
          <Box gridColumn={['1 / 3', '1 / 3', 'unset']}>
            <Text color='slate.600'>
              <SignUpText>{t('sign-up-text')}</SignUpText>
            </Text>
            <Box mt='1.2rem' className={this.state.subscribeState}>
              <Input
                maxWidth='320px'
                py='xs'
                placeholder='Email address'
                name='email'
                type='email'
                value={this.state.email}
                onChange={evt => this.updateEmail(evt)}
                errorMessage={
                  (this.state.subscribeState === 'failure' || undefined) &&
                  this.state.message
                }
                successMessage={
                  (this.state.subscribeState === 'success' || undefined) &&
                  this.state.message
                }
                after={
                  <SubscribeButton
                    type='submit'
                    rightCaret={<Icon
                                  name="chevron_right"
                                />}
                    onClick={this.subscribeEmail}
                  >
                    Subscribe
                  </SubscribeButton>
                }
              />
            </Box>
            <Icons
              gap='20px'
              mt='1.8rem'
              columns='repeat(7, 20px)'
            >
              <Link to='https://twitter.com/MakerDAO'>
                <Icon
                  name="twitter" />
              </Link>
              <Link to='https://www.reddit.com/r/MakerDAO/'>
                <Icon
                  name="reddit" />
              </Link>
              <Link to='https://t.me/makerdaoOfficial'>
                <Icon
                  name="telegram" />
              </Link>
              <Link to='https://chat.makerdao.com/'>
                <Icon
                  name="rocket_chat" />
              </Link>
              <Link to='https://blog.makerdao.com'>
                <Icon
                  name="medium" />
              </Link>
              {/*
                <Icon
                  name="we_chat"
                  sx={{ cursor: 'pointer' }}
                  onClick={this.toggleWeChatModal}
                />
              */}
              <Link to='https://www.youtube.com/MakerDAO'>
                <Icon
                  name="youtube" />
              </Link>
            </Icons>
            <Box mt='1.8rem' maxWidth='180px'>
              {this.props.langDropdown}
            </Box>
          </Box>
        </Grid>
        {/* <Modal
          show={this.state.showWeChatModal}
          onClose={this.toggleWeChatModal}
          width='380px'
        >
          <Flex flexDirection='column' alignItems='center'>
            <QRCode
              bgColor='#FFFFFF'
              fgColor='#000000'
              level='Q'
              style={{ width: '245px', height: '245px' }}
              value='http://weixin.qq.com/r/tjh0bADEN11IrUQP922k'
            />
            <Box fontSize='1.8rem'>{t('wechat-scan-text')}</Box>
            <Button mt='m' onClick={this.toggleWeChatModal}>
              Close
            </Button>
          </Flex>
        </Modal> */}
      </FooterContainer>
    );
  }
}

// Footer.propTypes = {
//   linkComponent: PropTypes.any,
//   host: PropTypes.string,
//   locale: PropTypes.string,
//   langDropdown: PropTypes.element,
// };

export default Footer;