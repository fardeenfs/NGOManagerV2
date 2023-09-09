import React, { useState, useEffect } from 'react';
import { Button, Input, Label, Select } from '@roketid/windmill-react-ui';
import PageTitle from 'example/components/Typography/PageTitle';
import Layout from 'example/containers/Layout';
import axios from 'axios';
import { useRouter } from 'next/router';
import SectionTitle from 'example/components/Typography/SectionTitle';
import { useAuth } from 'context/AuthContext';
import { useConfig } from 'context/ConfigContext';

function EditFamilyForm() {
    const { accessToken, loginLoading } = useAuth();
    const { currency, currencySymbol, setCurrency, timezone, setTimezone } = useConfig();
    const router = useRouter();
    const { jp } = router.query; // New: Retrieve the jp_number from the router query

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

    // New: Fetch the existing data when the component mounts
    useEffect(() => {
        if (jp) {
            axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/edit-member/${jp}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            })
            .then(response => {
                setFormData(response.data);
                console.log(response.data);
            })
            .catch(error => {
                console.error("Error fetching the existing data:", error);
            });
        }
    }, [jp, accessToken]);

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
        const { name, value, type, checked } = e.target;
        let parsedValue;
    
        if (name === 'jp_number') {
            parsedValue = parseFloat(value);
        } else if (type === 'checkbox') {
            parsedValue = checked ? true : false;
        } else if (['is_due_apply', 'is_pension', 'is_nri', 'is_govt', 'is_male', 'is_alive'].includes(name)) {
            parsedValue = value === 'true'; // convert "true" and "false" strings to booleans
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

        // Modified: PUT request instead of POST for updating
        const config = {
            method: 'put',
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/edit-member/${jp}`,
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
            <PageTitle>Edit Member</PageTitle>

            <div className="px-4 py-3 mb-8 ">
                
                <form onSubmit={handleSubmit}>
                    <Label className="mt-4">
                        <span>Member No. (JP)</span>
                        <Input className="mt-1" name="jp_number" value={formData.jp_number} onChange={handleInputChange} disabled/>
                    </Label>

                    <Label className="mt-4">
                        <span>Family No.</span>
                        <Input className="mt-1" name="family_number" type="number" value={formData.family_number} onChange={handleInputChange} />
                    </Label>

                    <Label className="mt-4">
                        <span>Census No.</span>
                        <Input className="mt-1" name="census_number" type="number" value={formData.census_number} onChange={handleInputChange} />
                    </Label>

                    <Label className="mt-4">
                        <span>House Name</span>
                        <Input className="mt-1" name="house_name" value={formData.house_name} onChange={handleInputChange} />
                    </Label>
                    <Label className="mt-4">
                        <span>Area</span>
                        <Input className="mt-1" name="area" value={formData.area} onChange={handleInputChange} />
                    </Label>

                    <Label className="mt-4">
                        <span>Post Office</span>
                        <Input className="mt-1" name="postoffice" value={formData.postoffice} onChange={handleInputChange} />
                    </Label>

                    <Label className="mt-4">
                        <span>Address</span>
                        <Input className="mt-1" name="address" value={formData.address} onChange={handleInputChange} />
                    </Label>

                    <br/>
                    <SectionTitle>Member Details</SectionTitle>

                    <Label className="mt-4">
                        <span>Name</span>
                        <Input className="mt-1" name="name" value={formData.name} onChange={handleInputChange} />
                    </Label>


                    <Label className="mt-4">
                        <span>Age</span>
                        <Input className="mt-1" name="age" type="number" value={formData.age} onChange={handleInputChange} />
                    </Label>

                    <Label className="mt-4">
                        <span>Mobile</span>
                        <Input className="mt-1" name="mobile" type="number" value={formData.mobile} onChange={handleInputChange} />
                    </Label>

                    <Label className="mt-4">
                        <span>Email</span>
                        <Input className="mt-1" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                    </Label>

                    <Label className="mt-4">
                        <span>Description</span>
                        <Input className="mt-1" name="description" value={formData.description} onChange={handleInputChange} />
                    </Label>

                    <Label className="mt-4">
                        <span>Remarks</span>
                        <Input className="mt-1" name="remarks" value={formData.remarks} onChange={handleInputChange} />
                    </Label>

                    <Label className="mt-4">
                        <span>Should Dues Apply To This Member?</span>
                        <Select name="is_due_apply" value={formData.is_due_apply} onChange={handleInputChange}>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                        </Select>
                    </Label>

                    <Label className="mt-4">
                        <span>Does This Member Collect Pensions?</span>
                        <Select name="is_pension" value={formData.is_pension} onChange={handleInputChange}>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                        </Select>
                    </Label>

                    <Label className="mt-4">
                        <span>Is This Member A Non Resident Of India? (Is NRI)</span>
                        <Select name="is_nri" value={formData.is_nri} onChange={handleInputChange}>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                        </Select>
                    </Label>

                    <Label className="mt-4">
                        <span>Is This Member A Government Employee? (Is Govt)</span>
                        <Select name="is_govt" value={formData.is_govt} onChange={handleInputChange}>
                            <option value={true}>Yes</option>
                            <option value={false}>No</option>
                        </Select>
                    </Label>

                    <Label className="mt-4">
                        <span>Is This Member Male?</span>
                        <Select name="is_male" value={formData.is_male} onChange={handleInputChange}>
                            <option value={true}>Yes</option>
                            <option value={false}>No</option>
                        </Select>
                    </Label>

                    <Label className="mt-4">
                        <span>Is This Member Alive?</span>
                        <Select name="is_alive" value={formData.is_alive} onChange={handleInputChange}>
                            <option value={true}>Yes</option>
                            <option value={false}>No</option>
                        </Select>
                    </Label>

                    <Button className="mt-4" type="submit">Submit</Button>
                </form>
            </div>
        </Layout>
    );
}

export default EditFamilyForm;
