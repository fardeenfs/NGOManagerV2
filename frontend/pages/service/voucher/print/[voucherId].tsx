import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  TableBody,
  TableContainer,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  TableFooter,
  Avatar,
  Badge,
  Pagination,
  Input,
  Button,
  ModalBody,
  ModalHeader,
  Modal
} from '@roketid/windmill-react-ui';
import { useAuth } from 'context/AuthContext';
import { useRouter } from 'next/router';
import Layout from 'example/containers/Layout';
import PageTitle from 'example/components/Typography/PageTitle';
import { useConfig } from 'context/ConfigContext';

const PrintVoucher = () => {
  const { accessToken, loginLoading } = useAuth();
  const { currency, currencySymbol, setCurrency, timezone, setTimezone } = useConfig();
  const router = useRouter();

  const { voucherId } = router.query;
  const [voucher, setVoucher] = useState(null);

  function formatCurrencyAmount(amount: Number) {
    return Number(amount).toLocaleString('en-IN', {
      style: 'currency',
      currency: currency,});
  }
  
  useEffect(() => {
    if (accessToken) {
    const fetchVoucher = async () => {
        const config = {
            method: 'get',
            url: process.env.NEXT_PUBLIC_BACKEND_URL+`/api/vouchers/print/?voucher-id=${voucherId}`,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          };
          if (accessToken && voucherId){
            try {
              axios.request(config)
                .then((response) => {
                  setVoucher(response.data);
                  console.log(response.data);
                })
            } catch (error) {
              console.error(error);
            };
          };
      };
    fetchVoucher();
    }
    if (!loginLoading && !accessToken){
      router.push('/login/');
    }
  }, [accessToken, voucherId]);

  if (!voucher) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="p-8 text-gray-500">
        <div className="mt-4 border rounded-md p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold"  >{process.env.NEXT_PUBLIC_APP_NAME}</h2>
            <div>
              <p className='text-xs'>Invoice ID: <b>{voucher.invoice.voucher_no}</b></p>
              <p className='text-xs'>Created: <b>{voucher.invoice.date}</b></p>
              <p className='text-xs'>Type: <b>{voucher.invoice.type}</b></p>
            </div>
          </div>
          <div className="mb-8">
            <p className='text-sm'>Name: <b>{voucher.invoice.name}</b></p>
            <p className='text-sm'>Address: <b>{voucher.invoice.address}</b></p>
          </div>
    <TableContainer className="mt-4">
      <Table>
        <TableHeader>
          <tr>
            <TableCell>Voucher Head</TableCell>
            <TableCell>Voucher Sub Head</TableCell>
            <TableCell>Amount</TableCell>
          </tr>
        </TableHeader>
        <TableBody>
          {voucher && voucher.invoice.recs.map((rec, index) => (
            <TableRow key={index}>
              <TableCell>{rec[0]}</TableCell>
              <TableCell>{rec[1]}</TableCell>
              <TableCell>{formatCurrencyAmount(rec[2])}</TableCell>
            </TableRow>
          ))}
        
          <TableRow>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell>
              <b>Total: {formatCurrencyAmount(voucher.invoice.total)}</b>
            </TableCell>
          </TableRow>
          </TableBody>
      </Table>
      
    </TableContainer>
    <br></br>
    <div className="mb-8">
            <p>Remarks: <b>{voucher.invoice.remarks}</b></p>
          </div>
    <Button onClick={() => window.print()} className="mt-8">Print Invoice</Button>


    </div>
    </div>
    

    </>
  );
};

export default PrintVoucher;
