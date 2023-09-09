import React, { useEffect, useState } from 'react'

import {
  Table,
  TableHeader,
  TableCell,
  TableBody,
  TableRow,
  TableFooter,
  TableContainer,
  Badge,
  Avatar,
  Button,
  Pagination,
} from '@roketid/windmill-react-ui'
import { EditIcon, TrashIcon } from 'icons'
import axios from 'axios';
import { useRouter } from 'next/router';
import { useAuth } from 'context/AuthContext';
import Layout from 'example/containers/Layout';
import PageTitle from 'example/components/Typography/PageTitle';
import Link from 'next/link';
import { useConfig } from 'context/ConfigContext';

interface Props {
  accounts: any[];
  txns: any[];
}

function Accounts() {
    const { accessToken, loginLoading } = useAuth();
    const { currency, currencySymbol, setCurrency, timezone, setTimezone } = useConfig();
    const router = useRouter();

    const [accounts, setAccounts] = useState([])

    function formatCurrencyAmount(amount: Number) {
      return Number(amount).toLocaleString('en-IN', {
        style: 'currency',
        currency: currency,});
    }

    useEffect(() => {
      if (accessToken) {
        const config = {
          method: 'get',
          url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/accounts/',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          }
        };
        axios.request(config)
          .then((response) => {
            console.log(response.data);
            setAccounts(response.data);
          })
          .catch((err) => {
            console.log(err);
          })
        }
        if (!loginLoading && !accessToken){
          router.push('/login/');
        }
      }, [accessToken]);


  return (
    <Layout>

<PageTitle>Accounts</PageTitle>
      <div id="accounts" className="text-base font-sans">
        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <TableCell>Account Serial</TableCell>
                <TableCell>Account Name</TableCell>
                <TableCell style={{ textAlign: 'right' }}>Opening Balance</TableCell>
                <TableCell style={{ textAlign: 'right' }}>Cash In Hand</TableCell>
                <TableCell style={{ textAlign: 'right' }}>Cash In Bank</TableCell>
                <TableCell style={{ textAlign: 'right' }}>Current Balance</TableCell>
                <TableCell>Actions</TableCell>
              </tr>
            </TableHeader>

            <TableBody>
              {accounts && accounts.map((val, index) => (
                <TableRow key={index}>
                  <TableCell>{val[0]}</TableCell>
                  <TableCell>{val[1]}</TableCell>
                  <TableCell style={{ textAlign: 'right' }}>{formatCurrencyAmount(val[2])}</TableCell>
                  <TableCell style={{ textAlign: 'right' }}>{formatCurrencyAmount(val[3])}</TableCell>
                  <TableCell style={{ textAlign: 'right' }}>{formatCurrencyAmount(val[4])}</TableCell>
                  <TableCell style={{ textAlign: 'right' }}>{formatCurrencyAmount(val[5])}</TableCell>
                  <TableCell><Link href={`/service/financial/accounts/${encodeURIComponent(val[0])}`}><a className="text-purple-600 hover:underline">Expand Account</a></Link></TableCell>
                  {/* <TableCell>
                    <table>
                      <tr>
                        <td>Voucher Income : {val[6][0]}</td>
                      </tr>
                      <tr>
                        <td>Voucher Expense : {val[6][1]}</td>
                      </tr>
                      <tr>
                        <td>Dues Income : {val[6][2]}</td>
                      </tr>
                    </table>
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* <div id="transactions">
        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <TableCell>Transaction Id</TableCell>
                <TableCell>Account Serial</TableCell>
                <TableCell>Account Name</TableCell>
                <TableCell>Account Number</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Transaction User</TableCell>
                <TableCell>Transaction Time</TableCell>
              </tr>
            </TableHeader>
            <TableBody>
              {accounts && txns.map((val, index) => (
                <TableRow key={index}>
                  <TableCell>{val[0]}</TableCell>
                  <TableCell>{val[1]}</TableCell>
                  <TableCell>{val[2]}</TableCell>
                  <TableCell>{val[3]}</TableCell>
                  <TableCell>{val[4]}</TableCell>
                  <TableCell>{val[5]}</TableCell>
                  <TableCell>{val[6]}</TableCell>
                  <TableCell>{val[7]}</TableCell>
                </TableRow>
               ))} 
            </TableBody>
          </Table>
        </TableContainer>
      </div> */}
    </Layout>
  )
}


export default Accounts;
