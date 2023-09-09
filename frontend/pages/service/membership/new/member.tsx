import React, { useState } from 'react';
import { Button, Input, Label, Select } from '@roketid/windmill-react-ui';
import PageTitle from 'example/components/Typography/PageTitle';
import Layout from 'example/containers/Layout';
import axios from 'axios';
import { useRouter } from 'next/router';
import SectionTitle from 'example/components/Typography/SectionTitle';
import { useAuth } from 'context/AuthContext';
import { useConfig } from 'context/ConfigContext';

function NewMemberForm() {
    const { accessToken, loginLoading } = useAuth();
    const { currency, currencySymbol, setCurrency, timezone, setTimezone } = useConfig();
    const router = useRouter();

    const [formData, setFormData] = useState({
        family_number: '',
        census_number: '',
        house_name: '',
        area: '',
        postoffice: '',
        address: '',
        jp_number: '',
        name: '',
        is_due_apply: 1,
        is_pension: 1,
        is_nri: 1,
        is_govt: 1,
        is_male: 1,
        is_alive: 1,
        age: '',
        mobile: '',
        email: '',
        description: 'N/A',
        remarks: 'N/A'
    });

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
        const { name, value, type, checked } = e.target;
        let parsedValue;
    
        if (name === 'jp_number') {
            parsedValue = parseFloat(value);
        } else if (type === 'checkbox') {
            parsedValue = checked ? 1 : 0;
        } else {
            parsedValue = value;
        }
    
        setFormData(prevState => ({ ...prevState, [name]: parsedValue }));
    }
    

    function handleSubmit(e: React.FormEvent): void {
        e.preventDefault();
        
        if (!accessToken) {
            router.push('/login/');
        }
    

        const config = {
            method: 'post',
            url: process.env.NEXT_PUBLIC_BACKEND_URL+'/api/new-member/',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            data: formData
          };
    
        axios.request(config)
            .then((response) => {
                console.log(response.data);
                if (response.data.notif) {
                    alert(response.data.notif);
                }
                router.push("/service/")
            })
            .catch((error) => {
                console.error("Error submitting the form:", error);
                if (error.response && error.response.data.notif) {
                    alert(error.response.data.notif);
                }
            });
    }

    return (
        <Layout>
            <PageTitle>New Member</PageTitle>
    
            <div className="px-4 py-3 mb-8">
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="flex space-x-4">
                        <Label className="flex-1">
                            <span>Member No. (JP)</span>
                            <Input className="mt-1 w-full" name="jp_number" value={formData.jp_number} onChange={handleInputChange} />
                        </Label>
                        <Label className="flex-1">
                            <span>Family No.</span>
                            <Input className="mt-1 w-full" name="family_number" type="number" value={formData.family_number} onChange={handleInputChange} />
                        </Label>
                    </div>
    
                    <Label>
                        <span>Name</span>
                        <Input className="mt-1 w-full" name="name" value={formData.name} onChange={handleInputChange} />
                    </Label>
    
                    <div className="flex space-x-4">
                        <Label className="flex-1">
                            <span>Age</span>
                            <Input className="mt-1 w-full" name="age" type="number" value={formData.age} onChange={handleInputChange} />
                        </Label>
                        <Label className="flex-1">
                            <span>Mobile</span>
                            <Input className="mt-1 w-full" name="mobile" type="number" value={formData.mobile} onChange={handleInputChange} />
                        </Label>
                    </div>
    
                    <Label>
                        <span>Email</span>
                        <Input className="mt-1 w-full" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                    </Label>
                    
                    <div className="flex space-x-4">
                        <Label className="flex-1">
                            <span>Description</span>
                            <Input className="mt-1 w-full" name="description" value={formData.description} onChange={handleInputChange} />
                        </Label>
                        <Label className="flex-1">
                            <span>Remarks</span>
                            <Input className="mt-1 w-full" name="remarks" value={formData.remarks} onChange={handleInputChange} />
                        </Label>
                    </div>
    
                    <div className="grid grid-cols-2 gap-4">
                        <Label>
                            <span>Should Dues Apply To This Member?</span>
                            <Select name="is_due_apply" value={formData.is_due_apply} onChange={handleInputChange}>
                                <option value={1}>Yes</option>
                                <option value={0}>No</option>
                            </Select>
                        </Label>
                        <Label>
                            <span>Does This Member Collect Pensions?</span>
                            <Select name="is_pension" value={formData.is_pension} onChange={handleInputChange}>
                                <option value={1}>Yes</option>
                                <option value={0}>No</option>
                            </Select>
                        </Label>
                        <Label>
                            <span>Is This Member A Non Resident Of India? (Is NRI)</span>
                            <Select name="is_nri" value={formData.is_nri} onChange={handleInputChange}>
                                <option value={1}>Yes</option>
                                <option value={0}>No</option>
                            </Select>
                        </Label>
                        <Label>
                            <span>Is This Member A Government Employee? (Is Govt)</span>
                            <Select name="is_govt" value={formData.is_govt} onChange={handleInputChange}>
                                <option value={1}>Yes</option>
                                <option value={0}>No</option>
                            </Select>
                        </Label>
                        <Label>
                            <span>Is This Member Male?</span>
                            <Select name="is_male" value={formData.is_male} onChange={handleInputChange}>
                                <option value={1}>Yes</option>
                                <option value={0}>No</option>
                            </Select>
                        </Label>
                        <Label>
                            <span>Is This Member Alive?</span>
                            <Select name="is_alive" value={formData.is_alive} onChange={handleInputChange}>
                                <option value={1}>Yes</option>
                                <option value={0}>No</option>
                            </Select>
                        </Label>
                    </div>
    
                    <Button className="mt-4" type="submit">Submit</Button>
                </form>
            </div>
        </Layout>
    );
}

export default NewMemberForm;
