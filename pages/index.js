import React, { Component } from "react";
import { Card, Button } from "semantic-ui-react";
import Link from "next/link";
import factory from "../ethereum/factory";
import Campaign from "../../ethereum/campaign";
import Layout from "../components/Layout";

class CampaignIndex extends Component {
    static async getInitialProps() {
        // next react bileşenleri derleyip gönderir. biz bunu component didmount da yaparsak hata alırız
        // ayrıca bu çalıştığı esnada window bileşeni aktif olmadığı için metamask ile irtibat kuramaz
        // bu noktada infura rinkby api ile bağlanır veri çekeriz
        // kullanıcının metamask onayı vermesine gerek kalmaz
        const campaigns = await factory.methods.getDeployedCampaigns().call();
        return { campaigns };
    }

    renderCampaigns() {
        const items = this.props.campaigns.map((campaign) => {
            const campaign = Campaign(campaign);
            const summary = await campaign.methods.getSummary().call();

            return {
                header: campaign,
                description: (
                    <Link href="/campaigns/[campaign]" as={`/campaigns/${campaign}`}>
                        <a>View Campaign</a>
                    </Link>
                ),
                fluid: true,
                style: {
                    marginLeft: "0",
                },
            };
        });

        return <Card.Group items={items} />;
    }

    render() {
        return (
            <Layout>
                <div>
                    <h3>Open Campaigns</h3>
                    <Link href="/campaigns/new">
                        <a>
                            <Button floated="right" content="Create Campaign" icon="add circle" primary />
                        </a>
                    </Link>
                    {this.renderCampaigns()}
                </div>
            </Layout>
        );
    }
}

export default CampaignIndex;
