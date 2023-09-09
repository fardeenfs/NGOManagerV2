import React, { useEffect, useState } from 'react'

import { Input, HelperText, Label, Select, Textarea, Button } from '@roketid/windmill-react-ui'
import PageTitle from 'example/components/Typography/PageTitle'
import SectionTitle from 'example/components/Typography/SectionTitle'

import Layout from 'example/containers/Layout'
import axios from 'axios'
import { useAuth } from 'context/AuthContext'
import { useRouter } from 'next/router'

interface VoucherTypes {
    [head: string]: string[];
  }

function IncomeVoucherForm() {
    const { accessToken } = useAuth();

    const router = useRouter();

    const [formData, setFormData] = useState({
        amount: '',
        type: 'Deposit',
        account: '',
        btn:'deposit-withdraw'
    });
    


    const [accountnames,setAccountNames] = useState([]);

    useEffect(() => {
        const config = {
          method: 'get',
          url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/account-names/',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          }
        };
        axios.request(config)
          .then((response) => {
            console.log(response.data);
            setAccountNames(response.data);
            const initialAcc = response.data[0];
            setFormData({
                ...formData,
                account: initialAcc[0],
            });
          })
          .catch((err) => {
            console.log(err);
          })
        }, [accessToken]
        );
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const config = {
            method: 'post',
            url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/manual-transactions/',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            data: formData,
        };
        console.log(formData);
        console.log(config);
        axios.request(config)
        .then((response) => {
            console.log(response.data);
            
            router.reload();
            })
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
        ...prev,
        [name]: value
        }));
    };


  return (
<>
      <PageTitle>New Deposit/Withdrawal</PageTitle>

      <>
        <form onSubmit={handleFormSubmit}>
          <Label>
            <span>Amount *</span>
            <Input
              className="mt-1"
              type="number"
              placeholder="Enter Amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </Label>

          <Label className="mt-4">
            <span>Deposit/Withdrawal *</span>
            <Select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="Deposit">Deposit</option>
              <option value="Withdraw">Withdraw</option>
            </Select>
          </Label>

          <Label className="mt-4">
            <span>Choose Account *</span>
            <Select
              id="account"
              name="account"
              value={formData.account}
              onChange={handleChange}
            >
              {accountnames.map((acc) => (
                <option key={acc[0]} value={acc[0]}>
                  {acc[0]} : {acc[1]}
                </option>
              ))}
            </Select>
          </Label>

          <div className="mt-4">
            <Button type="submit" name="btn" value="deposit-withdraw">
              Submit
            </Button>
          </div>
        </form>
      </>
    </>
  )
}

export default IncomeVoucherForm
