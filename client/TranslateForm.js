import React from 'react';
import Form from 'react-bootstrap/Form';
import fetch from 'isomorphic-fetch';
import { FloatingLabel, Col, Row, Button, Dropdown } from 'react-bootstrap';
import CountryDrop from './CountryDrop';
import 'react-bootstrap-country-select/dist/react-bootstrap-country-select.css';
import 'bootstrap/dist/css/bootstrap.css';


const countries = [
  { code: 'gr', title: 'Greece' },
  { code: 'gb', title: 'United Kingdom' },
  { code: 'us', title: 'United States' }
];
class Translate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      subject: '',
      comment: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }



  handleChange(event) {
    console.log("handleChange", event.target.name, event.target.value);
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    const { name, email, subject, comment } = this.state;
    const formData = {
      variables: {
        name: { value: name, type: 'string' },
        email: { value: email, type: 'string' },
        subject: { value: subject, type: 'string' },
        comment: { value: comment, type: 'string' },
      }
    };
    this.submitForm(formData);
    //https://davidgs.com:8443/engine-rest/process-definition/key/Process_1i8evdw/submit-form
    console.log("handleSubmit", formData);
    const { onSubmit } = this.props;
    //onSubmit({ name, email, subject, comment });
    console.log("Submit: ", name, email, subject, comment);
    this.setState({
      name: '',
      email: '',
      subject: '',
      comment: '',
    });
  }


  submitForm(data) {
    return fetch('https://davidgs.com:8443/engine-rest/process-definition/key/Process_1i8evdw/submit-form', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    if (response.status >= 200 && response.status < 300) {

      console.log(response);
     // window.location.reload();
      return response;
    } else {
      console.log('Somthing happened wrong');
    }
  }).catch(err => err);
}

  render() {
  return (
    <div className='App d-flex flex-column align-items-center'>
      <h1>Contact the Committee</h1>
      <Form name="new-beginnings" style={{ width: '600px' }}>
        <Form.Group>
          <Row className="mb-3">
            <Col md>
              <FloatingLabel controlId="floatingInputGrid" label="Google Project ID">
                <Form.Control name="project-id" onChange={this.handleChange} type="text" placeholder="Google Project ID" />
              </FloatingLabel>
            </Col>
            <Col md>
              <FloatingLabel
                controlId="floatingInput"
                label="Google Project Email"
                className="mb-3"
              >
                <Form.Control name="email" onChange={this.handleChange} type="email" placeholder="name@example.com" />
              </FloatingLabel>
            </Col>
          </Row>
        </Form.Group>
        <p></p>
        <Row>
        <Form.Group>
          <FloatingLabel
            controlId="floatingInput"
            label="Private Key"
            className="mb-3"
          >
              <Form.Control name="key" as='textarea'
                style={{ height: '100px' }} onChange={this.handleChange}
            />
          </FloatingLabel>
        </Form.Group>
        </Row>
        <Row>
          <Form.Group>
          <CountryDrop />
          </Form.Group>
        </Row>
        <Row>
        <p> </p>
        </Row>
        <Button type='submit' onClick={this.handleSubmit}>Submit</Button>
      </Form>
    </div>
  )
  }
}
export default Translate;