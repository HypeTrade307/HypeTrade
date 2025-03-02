import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function Example() {
  const [show, setShow] = useState(false);
  const [isVisible, setIsVis] = useState(true);

  const buttonClose = () => setIsVis(false);
  const buttonOpen = () => setIsVis(true);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
      <>

        {isVisible && <Button variant="primary" onClick={ () => { handleShow(); buttonClose(); }}>
          Delete profile
        </Button>}

        <Modal show={show} onHide={handleClose}  >
          <Modal.Header>
            <Modal.Title>This action cannot not be changed </Modal.Title>
          </Modal.Header>
          <Modal.Body></Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {handleClose(); buttonOpen();window.location.href = "/login";}}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => {handleClose(); buttonOpen()}}>
              delete profile
            </Button>
          </Modal.Footer>
        </Modal>
      </>
  );
}

export default Example;