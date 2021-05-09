// eksikleri var. sadece açıklamalar için eklendi
pragma solidity >=0.5.0 <0.7.0;

contract CampaignFactory{
    Campaign[] public deployedCampaigns;
    
    function createCampaign(uint minimumKatilimTutari) public {
        Campaign newCampaign = new Campaign(minimumKatilimTutari, msg.sender);
        
        deployedCampaigns.push(newCampaign);
    }
    
    function getDeployedCampaigns() public view returns(Campaign[] memory){
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address payable recipient;
        bool complate;
        mapping(address=>bool) approvals;                   // kişilerin oy verip vermediğini buradan sorgulucaz. approval = onay
        uint approvalCount;                                 // onay oyu verenlerin sayısı
    }
    
    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    mapping (address => bool) public approvers; 
                                                            // mapping de default value olayı önemli, bool tipinde default false, içinde olmayan adres gönderirsek false dönecek,
                                                            // bununla kullanıcının kayıtlı olup olmadığını sorgulucaz.
                                                            // for döngüsünden daha az gas fee ödenir
    uint public approversCount;                             // katılımcı sayısını mapping den alamayacağımız için böyle bir değişken yarattık
    
    modifier restricted() {
        require(msg.sender == manager);                     
        _;
    }

    constructor( uint minimumKatilimTutari, address creator ) public {
        manager = creator;                               // Bu kontrat diğer kontrattan çağırılırsa, msg.sender diğer kontratın adresi olur. kullanıcının adresi değil
        minimumContribution = minimumKatilimTutari;
    }

    // yeni katılımcı minimum deger üzerinde eth gönderirse eklenir
    function contribute() public payable{
        require( msg.value > minimumContribution );
        
        approvers[msg.sender] = true;
        approversCount++;
    }
    
    // yönetici, katılımcılardan para harcama talebi yapar
    function createRequest(string memory description, uint value, address payable recipient) public restricted {  
        Request memory yeniRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complate: false,
            approvalCount: 0
        });
        
        requests.push(yeniRequest);
    }
    
    // Yöneticinin harcama talebine kullanıcının oy vermesi
    function approveRequest(uint requestNumber) public {
        Request storage request = requests[requestNumber];          // storage=> var olan değişkeni işaret eder, memory=> geçici kopyasını oluşturur
        
        require(approvers[msg.sender]);                             // oy gönderenin adresi approvers içinde var mı? 
        require(!request.approvals[msg.sender]);                    // daha önceden bu requeste oy vermemiş mi?
        
        request.approvals[msg.sender] = true;                       // oy vermiş olduğunu kaydeder
        requests[requestNumber].approvalCount++;                    // oy sayımını mappingden yapamayacağımız için bu değişkenden oy sayımı yapılır
    } 
    
    // Yönetici, eğer oy sayısı yeterliyse ödeme emrini onaylar
    function finalizeRequest(uint requestNumber) public restricted {
        Request storage request = requests[requestNumber];
        
        require(!request.complate);                                 // işlem daha önceden onaylanmışsa ödeme yapılmıştır
        
        require(request.approvalCount > (approversCount / 2));      // onaylayanlar katılımcıların sayısının yarısından fazlayasa devam et
        
        request.recipient.transfer(request.value);                // ödeme yapılacak kişiye parayı gönderenin
        
        request.complate= true;
        
    }
    
}
