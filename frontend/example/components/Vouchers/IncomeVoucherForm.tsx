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
    const [voucherTypes, setVoucherTypes] = useState<VoucherTypes>({});

    const [subHeadOptions, setSubHeadOptions] = useState([]);


    const [formData, setFormData] = useState({
      vname: '',
      vaddress: '',
      vamt: '',
      vhead: '',
      vsubhead: '',
      vremarks:'',
      type:'INCOME'
    });
  

    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const config = {
        method: 'get',
        url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/vouchers/incomevouchertypes/',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        }
      };
      axios.request(config)
        .then((response) => {
          setVoucherTypes(response.data);

          const initialVhead = Object.keys(response.data)[0];
          const initialVsubhead = response.data[initialVhead][0];
          setFormData({
            ...formData,
            vhead: initialVhead,
            vsubhead: initialVsubhead,
          });
          setSubHeadOptions(response.data[initialVhead].map((subHead) => ({ label: subHead, value: subHead })));
          setLoading(false);
          console.log(response.data);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }, []);
    
    if (loading) {
      return <div>Loading...</div>;
    }
  
     
      const handleChange = (event) => {
        setFormData({
          ...formData,
          [event.target.name]: event.target.value
        });
      };
    
      const handleSelectChange = (name, value) => {
        setFormData({
          ...formData,
          [name]: value
        });
        if (name === 'vhead') {
          const subHeads = voucherTypes[value];
          setSubHeadOptions(subHeads.map((subHead) => ({ label: subHead, value: subHead })));
        }
      };
    
      const handleFormSubmit = (event) => {
        event.preventDefault();     
        const config = {
            method: 'post',
            url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/vouchers/voucherrecords/',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            data: formData
        };
        console.log(formData);
        axios.request(config)
        .then((response) => {
            console.log(response.data);
            router.reload();
            })
      };
    
      const headOptions = voucherTypes ? Object.keys(voucherTypes).map((head) => ({ label: head, value: head })) : [];
      console.log(headOptions);


  return (
    <>
      <PageTitle>Income Record Form</PageTitle>

      
        <form onSubmit={handleFormSubmit}>
          <Label>
            <span>Name</span>
            <Input
              className="mt-1"
              name="vname"
              placeholder="Name"
              value={formData.vname}
              onChange={handleChange}
            />
          </Label>

          <Label className="mt-4">
            <span>Address</span>
            <Input
              className="mt-1"
              name="vaddress"
              placeholder="Address"
              value={formData.vaddress}
              onChange={handleChange}
            />
          </Label>

          <Label className="mt-4">
            <span>Record Amount</span>
            <Input
              className="mt-1"
              type="number"
              name="vamt"
              placeholder="Record Amount"
              value={formData.vamt}
              onChange={handleChange}
              required
            />
          </Label>

          <Label className="mt-4">
            <span>Record Head</span>
            <Select
    id="vhead"
    name="vhead"
    onChange={(event) => handleSelectChange('vhead', event.target.value)}
    placeholder="Select Record Head"
>
    {headOptions.map((option) => (
        <option key={option.value} value={option.value}>
            {option.label}
        </option>
    ))}
</Select>

          </Label>

          <Label className="mt-4">
            <span>Record Sub Head</span>
            <Select
                id="vsubhead"
                name="vsubhead"
                onChange={(event) => handleSelectChange('vsubhead', event.target.value)}
                placeholder="Select Record Sub Head"
            >
                {subHeadOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
              ))}
        </Select>


          </Label>

          <Label className="mt-4">
            <span>Description</span>
            <Textarea
              className="mt-1"
              name="vremarks"
              rows={3}
              placeholder="Enter some long form content."
              onChange={handleChange}
            />
          </Label>

<div className="mt-4">
            <Button type='submit'
            >
              Submit
            </Button>
          </div>
        </form>
    </>
  )
}

export default IncomeVoucherForm
