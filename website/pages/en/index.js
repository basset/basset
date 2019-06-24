/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require("react");

const CompLibrary = require("../../core/CompLibrary.js");

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class HomeSplash extends React.Component {
  render() {
    const { siteConfig, language = "" } = this.props;
    const { baseUrl, docsUrl } = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ""}`;
    const langPart = `${language ? `${language}/` : ""}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const Logo = props => (
      <div className="projectLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    );

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        {siteConfig.title}
        <small>{siteConfig.tagline}</small>
      </h2>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <Logo img_src={`${baseUrl}img/basset.svg`} />
        <div className="inner">
          <ProjectTitle siteConfig={siteConfig} />
          <PromoSection>
            <Button href={siteConfig.repoUrl}>Github</Button>
            <Button href={docUrl("getting-started")}>Get started</Button>
          </PromoSection>
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const { config: siteConfig, language = "" } = this.props;
    const { baseUrl } = siteConfig;

    const Block = props => (
      <Container
        padding={["bottom", "top"]}
        id={props.id}
        background={props.background}
      >
        <GridBlock
          align="center"
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );

    const Description = () => (
      <Block background="light" align="left">
        {[
          {
            content: `Visual regression testing renders screenshots from static HTML generated snapshot through testing.
               It is typically used in the continuous integration (CI) pipeline.
               As future builds are created the screenshots are compared to the previous (baseline) screenshots to detect changes.
               Basset uses a pixel-by-pixel comparison to detect these changes.`
          }
        ]}
      </Block>
    );

    const Features = () => (
      <Block layout="threeColumn" id="features">
        {[
          {
            image: `${baseUrl}img/undraw_decide_3iwx.svg`,
            imageAlign: "top",
            content:
              "Track changes between your site builds. Approve differences to set them as your new baseline. Or set them as a **flake** to ignore them for future builds.",
            title: "Catch un-desired UI changes"
          },
          {
            content:
              "Capture an entire page, or capture the element you only care about. With basset you can use CSS selectors when creating snapshots to capture an element.",
            image: `${baseUrl}img/undraw_collection_u2np.svg`,
            imageAlign: "top",
            title: "Capture a page or element"
          },
          {
            content:
              "Browsers render HTML differently. Some differences might be small but others might be large and unsightly. With basset you can view how the supported browsers renders pages.",
            image: `${baseUrl}img/undraw_windows_q9m0.svg`,
            imageAlign: "top",
            align: "left",
            title: "Multiple browsers"
          },
          {
            image: `${baseUrl}img/undraw_setup_wizard_r6mr.svg`,
            imageAlign: "top",
            content:
              "Basset is an out of the box platform. You can use it with any testing framework. The repository includes a docker setup, and a setup for AWS using terraform, ansible and packer.",
            title: "Easy setup"
          },
          {
            image: `${baseUrl}img/undraw_version_control_9bpv.svg`,
            imageAlign: "top",
            content:
              "Basset currently supports integrations for Github and slack. Basset will set the github status for your PRs and uses slack webhooks to notify you of changes between builds.",
            title: "Integrations"
          },
          {
            image: `${baseUrl}img/undraw_open_source.svg`,
            imageAlign: "top",
            content:
              "Basset is completely open source. You can download the source code and modify it, or make contributions that the community can use.",
            title: "Open source"
          },
        ]}
      </Block>
    );

    const Showcase = () => {
      if ((siteConfig.users || []).length === 0) {
        return null;
      }

      const showcase = siteConfig.users
        .filter(user => user.pinned)
        .map(user => (
          <a href={user.infoLink} key={user.infoLink}>
            <img src={user.image} alt={user.caption} title={user.caption} />
          </a>
        ));

      const pageUrl = page => baseUrl + (language ? `${language}/` : "") + page;

      return (
        <div className="productShowcaseSection paddingBottom">
          <h2>Who uses basset?</h2>
          <div className="logos">{showcase}</div>
          <div className="more-users">
            <a className="button" href={pageUrl("users.html")}>
              More {siteConfig.title} Users
            </a>
          </div>
        </div>
      );
    };

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Description />
          <Features />
          <Showcase />
        </div>
      </div>
    );
  }
}

module.exports = Index;
