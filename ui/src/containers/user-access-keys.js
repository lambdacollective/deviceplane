import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment';

import api from '../api';
import utils from '../utils';
import Card from '../components/card';
import Table from '../components/table';
import Alert from '../components/alert';
import {
  Label,
  Button,
  Text,
  Code,
  Row,
  Icon,
  toaster,
} from '../components/core';

const UserAccessKeys = () => {
  const [accessKeys, setAccessKeys] = useState([]);
  const [newAccessKey, setNewAccessKey] = useState();
  const [backendError, setBackendError] = useState();
  const [keyToDelete, setKeyToDelete] = useState();

  const columns = useMemo(
    () => [
      {
        Header: 'Access Key ID',
        accessor: 'id',
        style: {
          flex: 3,
        },
      },
      {
        Header: 'Created At',
        accessor: ({ createdAt }) =>
          createdAt ? moment(createdAt).fromNow() : '-',
        style: {
          flex: '0 0 150px',
        },
      },
      {
        Header: ' ',
        Cell: ({ row }) =>
          keyToDelete === row.original.id ? (
            <>
              <Button
                title={<Icon icon="tick-circle" size={16} color="red" />}
                variant="icon"
                onClick={() => deleteAccessKey(keyToDelete)}
              />
              <Button
                title={<Icon icon="cross" size={16} color="white" />}
                variant="icon"
                onClick={() => setKeyToDelete(null)}
                marginLeft={3}
              />
            </>
          ) : (
            <Button
              title={<Icon icon="trash" size={16} color="red" />}
              variant="icon"
              onClick={() => setKeyToDelete(row.original.id)}
            />
          ),
        style: {
          justifyContent: 'flex-end',
          flex: '0 0 100px',
        },
      },
    ],
    [keyToDelete]
  );
  const tableData = useMemo(() => accessKeys, [accessKeys]);

  const fetchAccessKeys = async () => {
    try {
      const { data } = await api.userAccessKeys();
      setAccessKeys(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAccessKeys();
  }, []);

  const createAccessKey = async () => {
    setBackendError(null);
    try {
      const response = await api.createUserAccessKey();
      setAccessKeys([response.data, ...accessKeys]);
      setNewAccessKey(response.data.value);
      toaster.success('Access key created.');
    } catch (error) {
      setBackendError(utils.parseError(error, 'Access key creation failed.'));
      console.error(error);
    }
  };

  const deleteAccessKey = async id => {
    try {
      await api.deleteUserAccessKey({ id });
      toaster.success('Access key deleted.');
      await fetchAccessKeys();
      setKeyToDelete(null);
    } catch (error) {
      setBackendError(utils.parseError(error, 'Access key deletion failed.'));
      console.error(error);
      setKeyToDelete(null);
    }
  };

  return (
    <>
      <Card
        border
        title="Access Keys"
        size="xlarge"
        actions={[{ title: 'Create Access Key', onClick: createAccessKey }]}
      >
        <Alert show={backendError} variant="error" description={backendError} />
        <Alert
          show={!!newAccessKey}
          title="Access Key Created"
          description="Save this key! This is the only time you'll be able to view it. If
            you lose it, you'll need to create a new access key."
        >
          <Label>Access Key</Label>
          <Row>
            <Code>{newAccessKey}</Code>
          </Row>
        </Alert>
        <Table
          columns={columns}
          data={tableData}
          placeholder={
            <Text>
              There are no <strong>Access Keys</strong>.
            </Text>
          }
        />
      </Card>
    </>
  );
};

export default UserAccessKeys;
