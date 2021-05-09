import React, { Component } from "react";
import Router from "next/router";
import { Form, Button, Input, Message } from "semantic-ui-react";
import Layout from "../../components/Layout";
import factory from "../../ethereum/factory";
import web3 from "../../ethereum/web3";

class CampaignNew extends Component {
  state = {
    minimumContribution: "",
    errorMessage: "",
    loading: false,
    metinBasligi: ""
  };

  onSubmit = async event => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();
      await factory.methods
        .createCampaign(this.state.minimumContribution, this.state.metinBasligi)
        .send({
          from: accounts[0]
        });

      Router.push("/");
    } catch (error) {
      this.setState({ errorMessage: error.message });
    }

    this.setState({ loading: false });
  };

  render() {
    return (
      <Layout>
        <h3>Create a Campaign</h3>

        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Form.Field>
            
            <label>Proje Başlığı</label>
            <Input
              label="Baslik"
              labelPosition="left"
              value={this.state.metinBasligi}
              onChange={event =>
                this.setState({ metinBasligi: event.target.value })
              }
            />
            <label>Minimum contribution</label>
            <Input
              label="Min wei"
              labelPosition="left"
              value={this.state.minimumContribution}
              onChange={event =>
                this.setState({ minimumContribution: event.target.value })
              }
            />
          </Form.Field>

          <Message error header="Oops!" content={this.state.errorMessage} />
          <Button loading={this.state.loading} primary>
            Create!
          </Button>
        </Form>
      </Layout>
    );
  }
}

export default CampaignNew;
