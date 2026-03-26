<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MerchantOtherCharge extends Model
{
    protected $fillable = [
        'merchant_id',
        'delivery_charge',
        'packaging_charge',
        'platform_fee',
        'delivery_charge_tax',
        'packaging_charge_tax',
        'platform_fee_tax'
    ];
}
