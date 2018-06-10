sceneManager    = require '../tools/ArkSceneManager.coffee'
eventManager    = require '../event/ArkEventManager.coffee'
eventNames      = require '../event/ArkEventNames.coffee'
UserData        = require '../model/ArkUserData.coffee'

BalanceSheet    = require '../model/BalanceSheet.coffee'
ProfitStatement    = require '../model/ProfitStatement.coffee'
CashFlowStatement    = require '../model/CashFlowStatement.coffee'

utils = require '../tools/utils.coffee'

class GameLogic
    init: (@_dialog)->
        @_balanceObj = {}
        @_profitObj = {}
        @_cashFlowObj = {}
        @_registerEvents()
        @_loadTable("hs300")

    _registerEvents: ->
        eventManager.listen(eventNames.GAME_GET_RESULT, (options)=>
            options.callback?(@getStockDetailInfo(options.stockCode))
        )

        eventManager.listen(eventNames.GAME_FILTER, (options)=>
            profitAddRatio = options.profitAddRatio
            roe = options.roe
            pe = options.pe
            advanceReceipt = options.advanceReceipt
            receivableTurnoverDays = options.receivableTurnoverDays
            netProfitQuality = options.netProfitQuality
            debt = options.debt
            options.callback?(@findMatchConditionStock(profitAddRatio, roe, pe, advanceReceipt,
              receivableTurnoverDays, netProfitQuality, debt))
        )

        eventManager.listen(eventNames.GAME_LOAD_TABLE, (dir) =>
            return if @_loadingFileStatus
            global.canLoad = true
            @_loadTable(dir)
        )

        eventManager.listen(eventNames.GAME_CLEAR_OBJ, =>
            @_balanceObj = {}
            @_profitObj = {}
            @_cashFlowObj = {}
        )

        eventManager.listen(eventNames.GAME_PERCENT_AVERAGE, ({stockCode, callback})=>
            industry = @_balanceObj[stockCode].getIndustry()
            inventoryTurnoverRatioTable = []
            for stockCode in utils.getStockTable("allA")
                stockCode = stockCode.slice(2, 8)
                continue unless @_isAllTableLoadFinish(stockCode)
                if (@_balanceObj[stockCode].getIndustry() is industry)
                    inventoryTurnoverRatio = @_getInventoryTurnoverRatio(stockCode)
                    console.log("同行:#{@_balanceObj[stockCode].getBaseInfo()}, #{inventoryTurnoverRatio}")
                    inventoryTurnoverRatioTable.push inventoryTurnoverRatio
            return callback(utils.getAverage(inventoryTurnoverRatioTable))

        )

    _filterAdvanceReceiptsPercent:(stockCode, advanceReceipt) ->
        return true if advanceReceipt is -1
        percent = @_getAdvanceReceiptsPercent(stockCode)
        if percent  >= advanceReceipt
            return true
        return false

    _getAdvanceReceiptsPercent: (stockCode)->
        return @_balanceObj[stockCode].getAdvanceReceiptsPercent()

    _filterReceivableTurnoverDays: (stockCode, receivableTurnoverDays)->
        return true if receivableTurnoverDays is -1
        day = @_getReceivableTurnOverDays(stockCode)
        if day < receivableTurnoverDays
            return true
        return false

    _getReceivableTurnOverDays: (stockCode)->
        receivableValueTable = @_balanceObj[stockCode].getReceivableValue()
        inComeValueTable = @_profitObj[stockCode].getIncomeValue()
        daysTable = []
        for receivableValue, index in receivableValueTable
            break if index >= receivableValueTable.length - 1
            days = 360 / inComeValueTable[index] * (receivableValue + receivableValueTable[index + 1]) / 2
            daysTable.push days

        day = utils.getAverage(daysTable)
        return day

    _filterNetProfitQuality: (stockCode, netProfitQuality)->
        return true if netProfitQuality is -1
        ratioTable = @_getNetProfitQuality(stockCode)
        aveRatio = utils.getAverage(ratioTable)
        if aveRatio > netProfitQuality
            return true
        return false

    _filterROE: (stockCode, needRoe) ->
        return true if needRoe is -1
        roeTable = @_getROE(stockCode)
        aveRoe = utils.getAverage(roeTable)
        if aveRoe > needRoe
            return true
        return false

    _filterProfitAddRatio: (stockCode, needRatio)->
        return true if needRatio is -1
        profitAddRatio = @_profitObj[stockCode].getNetProfitAddRatio()
        if profitAddRatio > needRatio
            return true
        return false

    _filterPE: (stockCode, maxPe)->
        return true if maxPe is -1
        pe = @_profitObj[stockCode].getPE()
        if 0 < pe < maxPe
            return true
        return false

    _filterInterestDebt: (stockCode, limitInterestDebt)->
        return true if limitInterestDebt is -1
        interestDebt = @_balanceObj[stockCode].getInterestDebt()
        if interestDebt < limitInterestDebt
            return true
        return false

    _getStockInfo: (stockCode)->
        baseInfo = @_profitObj[stockCode].getBaseInfo()
        profitAddRatio = @_profitObj[stockCode].getNetProfitAddRatio()

        roeTable = @_getROE(stockCode)
        aveRoe = utils.getAverage(roeTable)
        
        PE  = @_profitObj[stockCode].getPE()
        return "\n" + utils.addTab(stockCode) + utils.addTab(baseInfo) +
            utils.addTab("净:#{profitAddRatio}") + 
            utils.addTab("roe:#{aveRoe}") +
            utils.addTab("PE:#{PE}") + 
            utils.addTab("应:#{@_getReceivableTurnOverDays(stockCode)}") +
            utils.addTab("预:#{@_getAdvanceReceiptsPercent(stockCode)}") +
            utils.addTab("现:#{utils.getAverage(@_getNetProfitQuality(stockCode))}") +
            "时:#{@_balanceObj[stockCode].getExistYears()}"
            

    _isAllTableLoadFinish: (stockCode)->
        balance = @_balanceObj[stockCode]?.isLoadFinish()
        profit = @_profitObj[stockCode]?.isLoadFinish()
        cashFlow = @_cashFlowObj[stockCode]?.isLoadFinish()
        return balance and profit and cashFlow

    findMatchConditionStock:(profitAddRatio, roe, pe, advanceReceipt,receivableTurnoverDays, netProfitQuality, debt)->
        matchStockTable = []
        for stockCode in utils.getStockTable("allA")
            stockCode = stockCode.slice(2, 8)
            continue unless @_isAllTableLoadFinish(stockCode)
            continue unless @_filterProfitAddRatio(stockCode, profitAddRatio)
            continue unless @_filterROE(stockCode, roe)
            continue unless @_filterPE(stockCode, pe)
            continue unless @_filterAdvanceReceiptsPercent(stockCode, advanceReceipt)
            continue unless @_filterReceivableTurnoverDays(stockCode, receivableTurnoverDays)
            continue unless @_filterNetProfitQuality(stockCode, netProfitQuality)
            continue unless @_filterInterestDebt(stockCode, debt)
            matchStockTable.push stockCode
        return @_getStockTableInfo(matchStockTable)

    _getStockTableInfo: (matchStockTable)->
        stockInfoTable = ["股票代码 \t 基本信息 \t 所属行业 \t 利润增长率 \t 平均ROE \t PE \t 应收 \t 预收 \t 现金流 \t  总数:#{matchStockTable.length}"]
        for stockCode in matchStockTable
            stockInfoTable.push @_getStockInfo(stockCode)
        console.log(stockInfoTable)
        length = stockInfoTable.length
        if stockInfoTable.length > 100
            stockInfoTable = stockInfoTable.slice(0, 100)
            stockInfoTable.push "too many stock:#{length}"
        return stockInfoTable

    _getROE: (stockCode)->
        netAssetsTable = @_balanceObj[stockCode].getNetAssets()
        netProfitsTable = @_profitObj[stockCode].getNetProfitTable()
        roeTable = []
        for netAssets, index in netAssetsTable
            break if index >= netAssetsTable.length - 1
            roe = ((netProfitsTable[index] / ((netAssets + netAssetsTable[index + 1]) / 2)) * 100).toFixed(2) + "%"
            roeTable.push roe + "\t"
        return roeTable

    _loadFileToObj: (stockCode)->
        @_balanceObj[stockCode] = new BalanceSheet(stockCode)
        @_profitObj[stockCode] = new ProfitStatement(stockCode)
        @_cashFlowObj[stockCode] = new CashFlowStatement(stockCode)

    _checkStockExist: (stockCode)->
        return stockCode in utils.getStockTable("allA")

    _loadTable: (dir)->
        totalIndex = 0
        stockTable = utils.getStockTable(dir)
        beginTime = new Date()
        @_loadingFileStatus = true
        loadFile = =>
            return unless global.canLoad
            global.canLoad = false
            if totalIndex >= stockTable.length
                @_dialog.controller.rootNode.unschedule(loadFile)
                now = new Date()
                dis = now - beginTime
                @_dialog.controller.ccb_loading_label.setString("load over: use time #{dis // 1000 }s")
                @_loadingFileStatus = false
                return
            stockCode = stockTable[totalIndex]
            isExist = @_checkStockExist(stockCode)
            if isExist
                stockCode = stockCode.slice(2, 8)
                @_dialog.controller.ccb_loading_label.setString("loading ...#{stockCode}... #{totalIndex}/#{stockTable.length}")
                if @_balanceObj[stockCode]?.isLoadFinish()
                    global.canLoad = true
                else
                    @_loadFileToObj(stockCode)
            else
                global.canLoad = true
            totalIndex++

        @_dialog.controller.rootNode.schedule(loadFile)
        loadFile()

    getStockDetailInfo: (stockCode)->
        infoTable = []
        unless @_profitObj[stockCode]?
            @_loadFileToObj(stockCode)
            return "loadFile ok, try again!"
        infoTable.push "基本信息:   " + @_profitObj[stockCode].getBaseInfo()
        infoTable.push "\nPE:   " + @_profitObj[stockCode].getPE()
        infoTable.push "\n总资产：#{utils.getValueDillion(@_balanceObj[stockCode].getTotalAssets()[0])}"
        infoTable.push "\n总市值：#{utils.getValueDillion(@_balanceObj[stockCode].getTotalMarketValue() / 10000)}"
        infoTable.push "\n Top10: #{@_balanceObj[stockCode].getTop10()}"
        infoTable.push "\n有息负债: #{@_balanceObj[stockCode].getInterestDebt()}%"
        infoTable.push "\n应收账款周转天数: #{@_getReceivableTurnOverDays(stockCode)}, #{@_getIndustryAverage(stockCode, "应收账款")}"
        infoTable.push "\n预收账款占总资产比例: #{@_getAdvanceReceiptsPercent(stockCode)}%， #{@_getIndustryAverage(stockCode, "预收账款")}"
        infoTable.push "\n存货周转率:#{@_getInventoryTurnoverRatio(stockCode)}%, #{@_getIndustryAverage(stockCode, "存货")}%"
        infoTable.push "\n净利润： " + utils.getValueDillion(@_profitObj[stockCode].getNetProfitTable())
        infoTable.push "\n毛利率: #{@_profitObj[stockCode].getSingleYearGrossProfitRatio()}, #{@_getIndustryAverage(stockCode, "毛利率")}%"
        infoTable.push "\n净利率: #{@_profitObj[stockCode].getSingleYearNetProfitRatio()}, #{@_getIndustryAverage(stockCode, "净利率")}%"
        infoTable.push "\n年净利润增长率:   " + @_profitObj[stockCode].getNetProfitYoy()
        infoTable.push "\n净利润复合增长率:   " + @_profitObj[stockCode].getNetProfitAddRatio() + "%"
        infoTable.push "\n现金流量比净利润:   " + @_getNetProfitQuality(stockCode) + "平均:#{utils.getAverage(@_getNetProfitQuality(stockCode))}"
        infoTable.push "\n历年ROE:   " + @_getROE(stockCode) + "平均: #{utils.getAverage(@_getROE(stockCode))}%"
        
        console.log(infoTable)
        infoTable

    _getNetProfitQuality: (stockCode)->
        netProfitTable = @_profitObj[stockCode].getNetProfitTable()
        workCashFlowTable = @_cashFlowObj[stockCode].getWorkCashFlow()
        ratioTable = []
        for netProfit , index in netProfitTable
            ratioTable.push (workCashFlowTable[index] / netProfit).toFixed(2)
        ratioTable

    _getInventoryTurnoverRatio: (stockCode)->
        averageInventory = @_balanceObj[stockCode].getSingleYearAverageInventory()
        operatingCosts = @_profitObj[stockCode].getOperatingCosts()[0]
        ratio = (operatingCosts / averageInventory).toFixed(2)
        ratio

    _getIndustryAverage: (stockCode, type)->
        industry = @_balanceObj[stockCode].getIndustry()
        sameIndustryInfo = []
        for stockCode in utils.getStockTable("allA")
            stockCode = stockCode.slice(2, 8)
            continue unless @_isAllTableLoadFinish(stockCode)
            if (@_balanceObj[stockCode].getIndustry() is industry)
                switch type
                    when "存货"
                        sameIndustryInfo.push @_getInventoryTurnoverRatio(stockCode)
                    when "应收账款"
                        sameIndustryInfo.push @_getReceivableTurnOverDays(stockCode)
                    when "预收账款"
                        sameIndustryInfo.push @_getAdvanceReceiptsPercent(stockCode)
                    when "毛利率"
                        sameIndustryInfo.push @_profitObj[stockCode].getSingleYearGrossProfitRatio()
                    when "净利率"
                        sameIndustryInfo.push @_profitObj[stockCode].getSingleYearNetProfitRatio()
        return "同行平均：" + utils.getAverage(sameIndustryInfo)

module.exports = GameLogic
